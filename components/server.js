require('./conn');
const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const Register = require('../components/register');
const app = express();
const http = require('http');
const server = http.createServer(app);
const bcrypt = require('bcryptjs');
const cors = require('cors');
const Add = require('./add');
const Bill = require('./bill');
const Notification = require('./Notification');
const listing = require('./listing');
const Chat = require('./chat');
const { timeDifference } = require('./Data');
const ScreenShots = require('./ScreenShots');
const Withdraw = require('./Withdraw');
const Bank = require('./Bank');
const History = require('./History');
const MyPlan = require('./MyPlan');
const Plan = require('./Plan');
const Promo = require('./Promo');
const Commission = require('./Commission');
const AdminRegister = require('./AdminRegister');


const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(cors());


const generateUniqueId = async () => {
  try {
    const date = new Date();
    const dateString = date.toISOString().slice(2, 10).replace(/-/g, '');

    let count = 1; // Start with count 1
    let uniqueId = `${dateString}${count}`; // Initial generated ID

    // Use a loop to check if the generatedId already exists
    while (await Register.findOne({ generatedId: uniqueId })) {
      count++; // Increment the count
      uniqueId = `${dateString}${count}`; // Generate a new ID with the updated count
    }

    return uniqueId;

  } catch (error) {
    console.error("Error generating unique ID:", error);
    throw error;
  }
};

const generatePromoId = async () => {
  try {
    const date = new Date();
    const dateString = date.toISOString().slice(2, 10).replace(/-/g, ''); // e.g., 250417

    let count = 1;

    const getRandomLetters = (length = 3) => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      let result = '';
      for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };

    let uniqueId = `${dateString}${getRandomLetters()}${count}`;

    while (await Promo.findOne({ code: uniqueId })) {
      count++;
      uniqueId = `${dateString}${getRandomLetters()}${count}`;
    }

    return uniqueId;

  } catch (error) {
    console.error("Error generating unique ID:", error);
    throw error;
  }
};


const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 9000); // 6-digit OTP
};

// Create a POST route to send OTP
app.post('/send-otp', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  const otp = generateOTP();

  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {

      user: 'tescoappofficial@gmail.com',
      pass: 'gvil inig hceo miwh',
    },
  });

  // Email options
  const mailOptions = {
    from: 'tescoappofficial@gmail.com',
    to: email,
    subject: 'Your OTP Code',
    html: `
    <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-family: Arial, sans-serif;">
      <div style="background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
        <h2 style="color: #333;">Your OTP Code</h2>
        <p style="font-size: 18px; color: #555;">Use the following OTP to verify your email:</p>
        <p style="font-size: 24px; font-weight: bold; color: #d9534f; background-color: #f8d7da; padding: 10px; display: inline-block; border-radius: 5px;">
          ${otp}
        </p>
        <p style="color: #777; font-size: 14px;">This OTP is valid for only 10 minutes.</p>
        <p style="color: #999; font-size: 12px;">If you didn’t request this, please ignore this email.</p>
      </div>
    </div>
  `
  };

  try {
    // Send email
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'OTP sent successfully', otp });
  } catch (error) {
    res.status(500).json({ message: 'Error sending email', error });
  }
});


app.post('/send-email', async (req, res) => {
  const { email, text, subject } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  // Configure the Nodemailer transporter
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'tescoappofficial@gmail.com',
      pass: 'gvil inig hceo miwh',
    },
  });

  // Email options
  const mailOptions = {
    from: 'tescoappofficial@gmail.com',
    to: email,
    subject: subject,
    text: text,
  };

  try {
    // Send email
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'email sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error sending email', error });
  }
});

app.post("/register", async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    console.log("Received request body:", req.body);

    const { name, email, password, referalCode } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ msg: "Required fields are mandatory" });
    }

    const existingUser = await Register.findOne({ email }).session(session);
    if (existingUser) {
      return res.status(400).json({ msg: "Email already exists" });
    }

    const userCount = await Register.countDocuments().session(session);

    // ✅ Only check referral code if not the first user
    if (userCount > 0) {
      const existingReferal = await Register.findOne({ generatedId: referalCode }).session(session);
      if (!existingReferal) {
        return res.status(400).json({ msg: "Invalid Referral Code" });
      }
    }

    const generatedId = await generateUniqueId();

    // Hash the password securely
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, 10);
    } catch (error) {
      return res.status(500).json({ msg: "Error hashing password" });
    }

    const user = new Register({
      name,
      email,
      password: hashedPassword,
      generatedId: generatedId.toString(),
      referalCode: userCount === 0 ? null : referalCode, // null for first user
    });

    await new Notification({
      sender: user._id,
      receiver: 'Admin',
      heading: 'New User',
      subHeading: `New Member Registered`,
      path: '/'
    }).save({ session });

    await user.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      generatedId: user.generatedId,
      referalCode: user.referalCode,
    });

    console.log("User registered successfully:", user);
  } catch (e) {
    await session.abortTransaction();
    console.error("Error during registration:", e);
    res.status(500).json({ msg: "Server error. Please try again later." });
  } finally {
    session.endSession();
  }
});

app.patch("/register/:email", async (req, res) => {
  try {
    const { email } = req.params;
    let updateData = req.body;

    if (updateData.password) {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(updateData.password, saltRounds);
      updateData.password = hashedPassword;
    }

    const updatedUser = await Register.findOneAndUpdate({ email }, updateData, {
      new: true,
    });

    if (!updatedUser) {
      return res.status(404).send({ message: "User not found" });
    }

    res.send(updatedUser);
  } catch (e) {
    res.status(400).send({ message: "Error updating user", error: e });
  }
});


app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate user input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email
    const user = await Register.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Login successful, return user data
    res.json({
      success: true,
      message: 'Login successful',
      data: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



app.delete("/login/:id", async (req, res) => {
  try {
    const user = await Register.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).send("Data not found");
    }
    if (!req.params.id) {
      res.status(201).send();
    }
  } catch (e) {
    res.status(400).send(e);
  }
})

app.post('/bill', async (req, res) => {
  try {
    const { email, name, address, house, city, postalCode, phone, status, cart } = req.body;
    const newBill = new Bill({ email, name, address, house, city, postalCode, phone, status, cart });
    await newBill.save();
    res.status(201).json(newBill);
  } catch (error) {
    console.error('Error creating register', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/bill', async (req, res) => {
  try {
    const bill = await Bill.find();
    res.json(bill);
  } catch (error) {
    console.error('Error fetching register', error);
    res.status(500).send('Internal Server Error');
  }
});

app.put('/bill/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updatedBill = await Bill.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );
    if (!updatedBill) {
      return res.status(404).send('Add not found');
    }
    res.status(200).json(updatedBill);
  } catch (error) {
    console.error('Error updating add', error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/add', async (req, res) => {
  try {
    const { image, heading, detail, price, category } = req.body;
    const newAdd = new Add({ image, heading, detail, price, category });
    await newAdd.save();
    res.status(201).json(newAdd);
  } catch (error) {
    console.error('Error creating register', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/add/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const add = await Add.findById(id);

    if (!add) {
      return res.status(404).json({ error: 'Add not found' });
    }
    res.json(add);
  } catch (error) {
    console.error('Error fetching add:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/add', async (req, res) => {
  try {
    const add = await Add.find();
    res.json(add);
  } catch (error) {
    console.error('Error fetching register', error);
    res.status(500).send('Internal Server Error');
  }
});

app.put('/add/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { image, heading, detail, price } = req.body;
    const updatedAdd = await Add.findByIdAndUpdate(
      id,
      { image, heading, detail, price },
      { new: true, runValidators: true }
    );
    if (!updatedAdd) {
      return res.status(404).send('Add not found');
    }
    res.status(200).json(updatedAdd);
  } catch (error) {
    console.error('Error updating add', error);
    res.status(500).send('Internal Server Error');
  }
});

app.delete('/add/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedAdd = await Add.findByIdAndDelete(id);
    if (!deletedAdd) {
      return res.status(404).send('Add not found');
    }
    res.status(200).send('Add deleted successfully');
  } catch (error) {
    console.error('Error deleting add', error);
    res.status(500).send('Internal Server Error');
  }
});



app.patch("/register/:id", async (req, res) => {
  try {
    const id = req.params.id;
    let updateData = req.body;

    const updatedUser = await Register.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedUser) {
      return res.status(404).send({ message: "User not found" });
    }

    res.send(updatedUser);
  } catch (e) {
    res.status(400).send({ message: "Error updating user", error: e.message });
  }
});


app.get('/register', async (req, res) => {
  try {
    const register = await Register.find();
    res.json(register);
  } catch (error) {
    console.error('Error fetching register', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/register/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const register = await Register.findById(id);
    res.json(register);
  } catch (error) {
    console.error('Error fetching register', error);
    res.status(500).send('Internal Server Error');
  }
});

app.delete('/register/:id', async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ message: 'ID is required' });
    }
    const deleteUser = await Register.findByIdAndDelete(id);
    if (!deleteUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(deleteUser);
  } catch (error) {
    console.error('Error fetching register', error);
    res.status(500).send('Internal Server Error');
  }
});


app.post('/notifications', async (req, res) => {
  try {
    const notification = new Notification(req.body);
    await notification.save();
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Error creating notification' });
  }
});

app.patch('/notifications/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const notification = await Notification.findByIdAndUpdate(id, req.body, { new: true }).sort({ _id: -1 });
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Error updating notification' });
  }
});

app.patch('/notifications/all-seen/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const notification = await Notification.updateMany({ receiver: id }, req.body, { new: true });
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Error updating notification' });
  }
});

app.get('/notifications/receiver/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const notifications = await Notification.find({ receiver: id }).sort({ _id: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications' });
  }
});

app.delete('/notifications/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await Notification.findByIdAndRemove(id);
    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting notification' });
  }
});

app.post('/addPlan/:id', async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const id = req.params.id;
    const { planId, investment, days, dailyProfit, endDate } = req.body;

    const user = await Register.findById(id).session(session);
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.deposit < investment) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Not enough balance' });
    }

    await Register.findByIdAndUpdate(
      id,
      { $inc: { totalInvest: investment, deposit: -investment } },
      { new: true, session }
    );

    const commissionId = '6801eaa0dd70baf6256dd3ce';
    const commissionStatus = await Commission.findById(commissionId);

    let level1, level2, level3;

    if (user.referalCode && commissionStatus.status === true) {
      // Level 1 (8%)
      level1 = await Register.findOneAndUpdate(
        { generatedId: user.referalCode },
        { $inc: { balance: investment * 8 / 100, totalCommission: investment * 8 / 100, level1Commission: investment * 8 / 100 } },
        { new: true, session }
      );

      await new Notification({
        sender: 'admin',
        receiver: level1._id,
        heading: 'Plan Activated',
        subHeading: `You have got commission of ${investment * 8 / 100}`,
        path: '/'
      }).save({ session });

      // Level 2 (3%)
      if (level1?.referalCode) {
        level2 = await Register.findOneAndUpdate(
          { generatedId: level1.referalCode },
          { $inc: { balance: investment * 3.5 / 100, totalCommission: investment * 3.5 / 100, level2Commission: investment * 3.5 / 100 } },
          { new: true, session }
        );

        await new Notification({
          sender: 'admin',
          receiver: level2._id,
          heading: 'Plan Activated',
          subHeading: `You have got commission of ${investment * 3.5 / 100}`,
          path: '/'
        }).save({ session });
      }
      // Level 3 (1%)
      if (level2?.referalCode) {
        level3 = await Register.findOneAndUpdate(
          { generatedId: level2.referalCode },
          { $inc: { balance: investment * 1.5 / 100, totalCommission: investment * 1.5 / 100, level3Commission: investment * 1.5 / 100 } },
          { new: true, session }
        );
        await new Notification({
          sender: 'admin',
          receiver: level3._id,
          heading: 'Plan Activated',
          subHeading: `You have got commission of ${investment * 1.5 / 100}`,
          path: '/'
        }).save({ session });
      }
    }

    await new Notification({
      sender: 'admin',
      receiver: user._id,
      heading: 'Plan Activated',
      subHeading: `You have activated a plan with amount ${investment}`,
      path: '/'
    }).save({ session });

    const newPlan = new MyPlan({
      planId,
      userId: id,
      investment,
      days,
      dailyProfit,
      endDate,
    });

    await newPlan.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json(newPlan);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Transaction error:', error);
    res.status(500).json({ message: 'Error creating plan', error: error.message });
  }
});


app.patch("/myplan/:id", async (req, res) => {
  try {
    const id = req.params.id;
    let updateData = req.body;

    const updatedPlan = await MyPlan.findByIdAndUpdate(id,
      updateData,
      { new: true });

    if (!updatedPlan) {
      return res.status(404).send({ message: "Error update plan" });
    }

    res.send(updatedPlan);
  } catch (e) {
    res.status(400).send({ message: "Error updating user", error: e.message });
  }
});

app.patch("/dailyclaim/:id", async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const id = req.params.id;
    const { planId } = req.body;
    const date = new Date();

    const user = await Register.findById(id).session(session);
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).send({ message: "User not found" });
    }

    const plan = await MyPlan.findById(planId).session(session);
    if (!plan) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).send({ message: "Plan not found" });
    }

    await Register.findByIdAndUpdate(
      id,
      { $inc: { balance: plan.dailyProfit } },
      { new: true, session }
    );

    if (date >= plan.endDate) {
      await MyPlan.findByIdAndUpdate(
        planId,
        { status: 'complete' },
        { new: true, session }
      );
    } else {
      await MyPlan.findByIdAndUpdate(
        planId,
        { status: 'pending', lastClaim: date },
        { new: true, session }
      );
    }

    await new Notification({
      sender: 'admin',
      receiver: user._id,
      heading: 'Claim',
      subHeading: `You have successfully claimed your daily profit of ${plan.dailyProfit}`,
      path: '/'
    }).save({ session });

    await session.commitTransaction();
    session.endSession();

    res.send({ message: 'Daily claim updated successfully' });

  } catch (e) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).send({ message: "Error updating user", error: e.message });
  }
});



app.get('/myplan/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const plan = await MyPlan.find({ userId: id }).sort({ _id: -1 });
    const date = new Date();

    const updatePromises = plan.map(async (item) => {
      if (item.status === 'pending' && timeDifference(item.lastClaim) === 'ready') {
        await MyPlan.findByIdAndUpdate(item._id, {
          status: 'ready',
          lastClaim: date,
        });
      }
    });

    await Promise.all(updatePromises);

    const updatedPlan = await MyPlan.find({ userId: id }).sort({ _id: -1 });
    res.json(updatedPlan);
  } catch (error) {
    console.error('Error fetching plan', error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/screenshot', async (req, res) => {
  try {
    const { payerId, amount } = req.body
    const screenshot = new ScreenShots(req.body);
    await screenshot.save();
    const history = new History({ userId: payerId, type: 'deposit', amount, requestId: screenshot._id });
    await history.save();


    await new Notification({
      sender: payerId,
      receiver: 'Admin',
      heading: 'Deposit Request',
      subHeading: `New Deposit Request of amount ${amount} Rs.`,
      path: '/'
    }).save();

    res.json(screenshot);
  } catch (error) {
    res.status(500).json({ message: 'Error creating notification' });
  }
});

app.get('/screenshot', async (req, res) => {
  try {
    const screenshot = await ScreenShots.find().sort({ _id: -1 });
    res.json(screenshot);
  } catch (error) {
    res.status(500).json({ message: 'Error creating notification' });
  }
});

app.get('/screenshot/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const screenshot = await ScreenShots.findById(id);
    res.json(screenshot);
  } catch (error) {
    res.status(500).json({ message: 'Error creating notification' });
  }
});


app.patch("/verifyscreenshot/:id", async (req, res) => {
  const session = await Register.startSession();
  session.startTransaction();

  try {
    const id = req.params.id;
    const { amount, screenshotId } = req.body;

    const user = await Register.findById(id).session(session);

    const find = await ScreenShots.findById(screenshotId).session(session);
    if (find.scam || find.verify) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ error: 'Cannot perform action' });
    }
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).send({ message: "User not found" });
    }

    await ScreenShots.findByIdAndUpdate(
      screenshotId,
      { verify: true },
      { new: true, session }
    );

    await Register.findByIdAndUpdate(
      id,
      { $inc: { deposit: amount, totalDeposit: amount } },
      { new: true, session }
    );

    await History.findOneAndUpdate({ requestId: screenshotId }, { status: 'complete' }, { new: true, session });

    await new Notification({
      sender: 'admin',
      receiver: user._id,
      heading: 'Deposit Successfully',
      subHeading: `You have received a deposit of ${amount}`,
      path: '/'
    }).save({ session });

    await session.commitTransaction();
    session.endSession();
    res.status(200).send({ message: "Deposit and referrals updated successfully" });

  } catch (e) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).send({ message: "Error updating user", error: e.message });
  }
});

app.patch("/rejectscreenshot/:id", async (req, res) => {
  const session = await Register.startSession();
  session.startTransaction();

  try {
    const id = req.params.id;
    const { amount, screenshotId } = req.body;

    const find = await ScreenShots.findById(screenshotId).session(session);
    if (find.scam) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ error: 'already rejected' });
    }

    const user = await Register.findById(id).session(session);
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).send({ message: "User not found" });
    }

    await ScreenShots.findByIdAndUpdate(
      screenshotId,
      { verify: false, scam: true },
      { new: true, session }
    );

    await History.findOneAndUpdate({ requestId: screenshotId }, { status: 'rejected' }, { new: true, session });

    await new Notification({
      sender: 'admin',
      receiver: user._id,
      heading: 'Deposit Rejected',
      subHeading: `Your deposit of amount ${amount} has been rejected`,
      path: '/'
    }).save({ session });

    await session.commitTransaction();
    session.endSession();
    res.status(200).send({ message: "Deposit and referrals updated successfully" });

  } catch (e) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).send({ message: "Error updating user", error: e.message });
  }
});


app.get("/mylevels/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const user = await Register.findById(id);
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    // Fetch level1 users based on the generatedId of the user
    const level1 = await Register.find({ referalCode: user.generatedId });

    // Fetch level2 users based on the generatedId of level1 users
    const level2 = level1.length > 0
      ? await Register.find({ referalCode: { $in: level1.map(user => user.generatedId) } })
      : [];

    // Fetch level3 users based on the generatedId of level2 users
    const level3 = level2.length > 0
      ? await Register.find({ referalCode: { $in: level2.map(user => user.generatedId) } })
      : [];

    res.send({ level1, level2, level3 });
  } catch (e) {
    res.status(400).send({ message: "Error fetching levels", error: e.message });
  }
});

app.get('/details/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const user = await Register.findById(id);

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    let totalTeamDeposit = 0;

    // Level 1
    const level1 = await Register.find({ referalCode: user.generatedId });
    const level1TotalDeposit = level1.reduce((acc, u) => acc + (u.totalDeposit || 0), 0);
    const level1TotalInvest = level1.reduce((acc, u) => acc + (u.totalInvest || 0), 0);
    totalTeamDeposit += level1TotalDeposit;

    // Level 2
    const level2 = await Register.find({
      referalCode: { $in: level1.map(u => u.generatedId) }
    });
    const level2TotalDeposit = level2.reduce((acc, u) => acc + (u.totalDeposit || 0), 0);
    const level2TotalInvest = level2.reduce((acc, u) => acc + (u.totalInvest || 0), 0);
    totalTeamDeposit += level2TotalDeposit;

    // Level 3
    const level3 = await Register.find({
      referalCode: { $in: level2.map(u => u.generatedId) }
    });
    const level3TotalDeposit = level3.reduce((acc, u) => acc + (u.totalDeposit || 0), 0);
    const level3TotalInvest = level3.reduce((acc, u) => acc + (u.totalInvest || 0), 0);
    totalTeamDeposit += level3TotalDeposit;

    const [plan1, plan2, plan3, plan4, plan5, plan6, plan7, plan8, plan9, plan10, plan11, plan12, plan13] = await Promise.all([
      MyPlan.find({ planId: '1' }),
      MyPlan.find({ planId: '2' }),
      MyPlan.find({ planId: '3' }),
      MyPlan.find({ planId: '4' }),
      MyPlan.find({ planId: '5' }),
      MyPlan.find({ planId: '6' }),
      MyPlan.find({ planId: '7' }),
      MyPlan.find({ planId: '8' }),
      MyPlan.find({ planId: '9' }),
      MyPlan.find({ planId: '10' }),
      MyPlan.find({ planId: '11' }),
      MyPlan.find({ planId: '12' }),
      MyPlan.find({ planId: '13' }),
    ]);

    res.send({
      totalTeamDeposit,
      totalTeamCommission: user.level1Commission + user.level2Commission + user.level3Commission || 0,
      totalMembers: level1.length + level2.length + level3.length,
      level1Commission: user.level1Commission,
      level2Commission: user.level2Commission,
      level3Commission: user.level3Commission,
      plan1: plan1.length,
      plan2: plan2.length,
      plan3: plan3.length,
      plan4: plan4.length,
      plan5: plan5.length,
      plan6: plan6.length,
      plan7: plan7.length,
      plan8: plan8.length,
      plan9: plan9.length,
      plan10: plan10.length,
      plan11: plan11.length,
      plan12: plan12.length,
      plan13: plan13.length,
    });

  } catch (e) {
    res.status(400).send({
      message: "Error fetching user details",
      error: e.message
    });
  }
});


app.post('/withdraw', async (req, res) => {
  try {
    const { sender, receiver, name, bank, amount, charges } = req.body;
    const newWithdraw = new Withdraw({ sender, receiver, name, bank, amount, charges });
    await newWithdraw.save();
    const history = new History({ userId: sender, type: 'withdraw', amount, requestId: newWithdraw._id });
    await history.save();


    await new Notification({
      sender: sender,
      receiver: 'Admin',
      heading: 'Withdraw Request',
      subHeading: `New Withdraw Request of amount ${amount} Rs.`,
      path: '/'
    }).save();

    res.status(201).json(newWithdraw);
  } catch (error) {
    console.error('Error creating withdraw', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/withdraw', async (req, res) => {
  try {
    const withdraw = await Withdraw.find().sort({ _id: -1 });
    res.json(withdraw);
  } catch (error) {
    console.error('Error fetching withdraw', error);
    res.status(500).send('Internal Server Error');
  }
});
// .reduce((acc, u) => acc + (u.totalInvest || 0), 0);

app.get('/withdraw-charges', async (req, res) => {
  try {
    const withdraw = await Withdraw.find().sort({ _id: -1 });
    const approvedWithdraw = await withdraw.filter(item => item.pending === false && item.scam === false);
    const total = await approvedWithdraw.reduce((acc, u) => acc + (u.charges || 0), 0);
    res.json(total);
  } catch (error) {
    console.error('Error fetching withdraw', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/withdraw/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const withdraw = await Withdraw.findById(id);
    res.json(withdraw);
  } catch (error) {
    console.error('Error fetching withdraw', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/withdraw/reciever/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const withdraw = await Withdraw.find({ receiver: id }).sort({ _id: -1 });
    res.json(withdraw);
  } catch (error) {
    console.error('Error fetching withdraw', error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/bank', async (req, res) => {
  try {
    const { userId, bankName, accountName, accountNumber } = req.body;

    const bankExist = await Bank.findOne({ accountNumber });
    if (bankExist) {
      return res.status(400).json({ message: 'Bank account already exists' });
    }

    const newBank = new Bank({ userId, bankName, accountName, accountNumber });
    await newBank.save();
    res.status(201).json(newBank);
  } catch (error) {
    console.error('Error creating bank', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/bank/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const bank = await Bank.findOne({ userId: id });
    res.json(bank);
  } catch (error) {
    console.error('Error getting bank', error);
    res.status(500).send('Internal Server Error');
  }
});

app.patch('/bank/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { accountNumber } = req.body;

    if (accountNumber) {
      const bankExist = await Bank.findOne({ accountNumber, _id: { $ne: id } });
      if (bankExist) {
        return res.status(400).json({ message: 'Bank account already exists' });
      }
    }

    const updateBank = await Bank.findByIdAndUpdate(id, req.body, { new: true });
    if (!updateBank) {
      return res.status(404).json({ message: 'Bank not found' });
    }

    res.json(updateBank);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating bank' });
  }
});




app.patch("/verifywithdraw/:id", async (req, res) => {
  const session = await Withdraw.startSession();
  session.startTransaction();

  try {
    const id = req.params.id;

    const withdraw = await Withdraw.findById(id).session(session);
    if (!withdraw) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).send({ message: "User not found" });
    }

    await Withdraw.findByIdAndUpdate(
      id,
      { pending: false },
      { new: true, session }
    );

    await Register.findByIdAndUpdate(
      withdraw.sender,
      {
        $inc: {
          balance: -withdraw.amount,
          totalWithdraw: withdraw.amount - (withdraw.amount * 2 / 100),
        },
      },
      { new: true, session }
    );

    await History.findOneAndUpdate({ requestId: id }, { status: 'complete' }, { new: true, session });
    await new Notification({
      sender: 'admin',
      receiver: withdraw.sender,
      heading: 'Withdraw Successfully',
      subHeading: `You have received amount of ${withdraw.amount}`,
      path: '/'
    }).save({ session });

    await session.commitTransaction();
    session.endSession();
    res.status(200).send({ message: "Deposit and referrals updated successfully" });

  } catch (e) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).send({ message: "Error updating user", error: e.message });
  }
});

app.patch("/rejectwithdraw/:id", async (req, res) => {
  const session = await Withdraw.startSession();
  session.startTransaction();

  try {
    const id = req.params.id;

    const withdraw = await Withdraw.findById(id).session(session);
    if (!withdraw) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).send({ message: "User not found" });
    }

    if (withdraw.pending && withdraw.scam) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).send({ message: "Already Reject" });
    }

    await Withdraw.findByIdAndUpdate(
      id,
      { pending: true, scam: true },
      { new: true, session }
    );

    await History.findOneAndUpdate({ requestId: id }, { status: 'rejected' }, { new: true, session });
    await new Notification({
      sender: 'admin',
      receiver: withdraw.sender,
      heading: 'Withdraw Rejected',
      subHeading: `Your Request for Withdraw of amount ${withdraw.amount} has been rejected.`,
      path: '/'
    }).save({ session });

    await session.commitTransaction();
    session.endSession();
    res.status(200).send({ message: "Deposit and referrals updated successfully" });

  } catch (e) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).send({ message: "Error updating user", error: e.message });
  }
});


app.post('/history', async (req, res) => {
  try {
    const { userId, type, amount } = req.body;
    const newHistory = new History({ userId, type, amount });
    await newHistory.save();
    res.status(201).json(newHistory);
  } catch (error) {
    console.error('Error creating history', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/withdraw-history/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const withdrawHistory = await History.find({ userId: id, type: 'withdraw' }).sort({ _id: -1 });
    res.json(withdrawHistory);
  } catch (error) {
    console.error('Error getting bank', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/deposit-history/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const withdrawHistory = await History.find({ userId: id, type: 'deposit' }).sort({ _id: -1 });
    res.json(withdrawHistory);
  } catch (error) {
    console.error('Error getting bank', error);
    res.status(500).send('Internal Server Error');
  }
});


app.get('/last-withdraw/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const withdraw = await Withdraw.findOne({ sender: id }).sort({ _id: -1 });
    res.json(withdraw);
  } catch (error) {
    console.error('Error getting getting withdraw', error);
    res.status(500).send('Internal Server Error');
  }
});

app.patch("/edit-password/:email", async (req, res) => {
  try {
    const { email } = req.params;
    let updateData = req.body;

    // If the request includes a new password
    if (updateData.password) {
      // Fetch the user first
      const existingUser = await Register.findOne({ email });

      if (!existingUser) {
        return res.status(404).send({ message: "User not found" });
      }

      // If an old password is provided, verify it
      if (updateData.oldPassword) {
        const isMatch = await bcrypt.compare(updateData.oldPassword, existingUser.password);
        if (!isMatch) {
          return res.status(401).send({ message: "Old password is incorrect" });
        }
      }

      // Hash the new password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(updateData.password, saltRounds);
      updateData.password = hashedPassword;

      // Remove oldPassword from the update payload
      delete updateData.oldPassword;
    }

    // Update the user with new data
    const updatedUser = await Register.findOneAndUpdate({ email }, updateData, {
      new: true,
    });

    if (!updatedUser) {
      return res.status(404).send({ message: "User not found" });
    }

    res.status(200).send(updatedUser);
  } catch (e) {
    console.error(e);
    res.status(500).send({ message: "Error updating user", error: e.message });
  }
});


app.get("/active-users", async (req, res) => {
  try {
    const plan = await MyPlan.find();
    const uniqueUserIds = new Set(plan.map(item => item.userId));
    const idsArray = Array.from(uniqueUserIds); // Convert Set to Array
    res.send({ data: idsArray });
  } catch (e) {
    res.status(400).send({ message: "Error fetching plan", error: e.message });
  }
});

app.post('/plan', async (req, res) => {
  try {
    const { id, image, name, days, profit, amount, lock } = req.body;
    const newPlan = new Plan({ id, image, name, days, profit, amount, lock });
    await newPlan.save();
    res.status(201).json(newPlan);
  } catch (error) {
    console.error('Error creating plan', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/plan', async (req, res) => {
  try {
    const plans = await Plan.find();
    res.status(200).json(plans);
  } catch (error) {
    console.error('Error fetching plans:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.get('/plan/:id', async (req, res) => {
  try {
    const id = req.params.id;
    console.log(`Fetching plan with ID: ${id}`);

    const plan = await Plan.findOne({ id: id });

    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    res.status(200).json(plan);
  } catch (error) {
    console.error('Error fetching plan:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});



app.patch('/plan/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const updatedPlan = await Plan.findByIdAndUpdate(id, req.body, {
      new: true, // returns the updated document
    });

    if (!updatedPlan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    res.status(200).json(updatedPlan);
  } catch (error) {
    console.error('Error updating plan:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.post('/promo', async (req, res) => {
  try {
    const { amount, limit } = req.body;

    const uniqueId = await generatePromoId();

    const promoExists = await Promo.findOne({ code: uniqueId });
    if (promoExists) {
      return res.status(400).json({ message: 'Promo code already exists' });
    }

    const promo = new Promo({ code: uniqueId, amount, limit });
    await promo.save();

    res.status(201).json(promo);
  } catch (error) {
    console.error('Error creating promo:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/promo', async (req, res) => {
  try {
    const promos = await Promo.find().sort({ _id: -1 });
    res.json(promos);
  } catch (error) {
    console.error('Error fetching promos:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.patch('/promo/claim/:code', async (req, res) => {

  const session = await mongoose.startSession(); // Start a new session
  session.startTransaction(); // Start the transaction
  try {
    const { code } = req.params;
    const { userId, name } = req.body;

    const havePlan = await MyPlan.find({ userId });
    if (havePlan.length === 1 && havePlan[0].investment === 0 || havePlan.length === 0) {
      return res.status(404).json({ message: 'Buy Plan To Claim' });
    }
    // Find promo by code
    const promo = await Promo.findOne({ code }).session(session);

    if (promo.claimBy.length >= promo.limit) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).send({ message: "Limit Over" });
    }

    if (!promo) {
      return res.status(404).json({ message: 'Promo not found' });
    }

    // Check if the promo has already been claimed by the user
    const alreadyClaimed = promo.claimBy.some(claim => claim.userId.toString() === userId);
    if (alreadyClaimed) {
      return res.status(400).json({ message: 'User already claimed this promo' });
    }

    // Update the user's balance
    const user = await Register.findByIdAndUpdate(
      userId,
      { $inc: { balance: promo.amount } },
      { new: true, session }
    );

    if (!user) {
      throw new Error('User not found');
    }

    // Save the notification about the promo claim
    await new Notification({
      sender: 'admin',
      receiver: userId,
      heading: 'Promo Claimed',
      subHeading: `You have successfully claimed your promo code reward of ${promo.amount} Rs.`,
      path: '/'
    }).save({ session });

    // Add the user to the promo claim list
    promo.claimBy.push({ userId, name });
    await promo.save({ session });

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    res.json({ message: 'Promo claimed successfully', promo });
  } catch (error) {
    // Rollback transaction in case of error
    await session.abortTransaction();
    session.endSession();

    console.error('Error claiming promo:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


app.get('/promo/today-claim', async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const promos = await Promo.find({
      claimBy: {
        $elemMatch: {
          claimedAt: { $gte: startOfDay, $lte: endOfDay }
        }
      }
    });

    const claimedToday = [];

    promos.forEach(promo => {
      promo.claimBy.forEach(claim => {
        if (claim.claimedAt >= startOfDay && claim.claimedAt <= endOfDay) {
          claimedToday.push({
            name: claim.name,
            amount: promo.amount
          });
        }
      });
    });

    res.json(claimedToday);
  } catch (error) {
    console.error('Error fetching today\'s claims:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


app.get('/total-withdraw', async (req, res) => {
  try {
    const totalWithdraw = await Withdraw.aggregate([
      { $match: { pending: false } },
      { $group: { _id: null, totalAmount: { $sum: "$amount" } } }
    ]);

    const total = totalWithdraw[0]?.totalAmount || 0;
    res.status(200).json({ success: true, totalWithdraw: total });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error });
  }
});

app.get('/total-deposit', async (req, res) => {
  try {
    const totalWithdraw = await ScreenShots.aggregate([
      { $match: { verify: true } },
      { $group: { _id: null, totalAmount: { $sum: "$amount" } } }
    ]);

    const total = totalWithdraw[0]?.totalAmount || 0;
    res.status(200).json({ success: true, totalWithdraw: total });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error });
  }
});

app.post('/commission', async (req, res) => {
  try {
    const { status, level1, level2, level3 } = req.body;

    const newCommission = new Commission({ status, level1, level2, level3 });
    await newCommission.save();

    res.status(201).json(newCommission);
  } catch (error) {
    console.error('Error creating Commission:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/commission/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const commission = await Commission.findById(id);
    res.status(200).json(commission);
  } catch (error) {
    console.error('Error fetching commission:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


app.patch('/commission/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { status } = req.body;
    if (!id || id === 'null' || id === 'undefined') {
      return res.status(400).json({ message: 'Invalid commission ID' });
    }
    const updateCommission = await Commission.findByIdAndUpdate(
      id,
      { status }, // update only allowed fields
      { new: true } // return new document, validate schema
    );
    if (!updateCommission) {
      return res.status(404).json({ message: 'Commission not found' });
    }

    await new Notification({
      sender: 'Admin',
      receiver: 'Admin',
      heading: 'Commission Status',
      subHeading: `Commission Status Updated to ${status ? 'Active' : 'Inactive'}`,
      path: '/'
    }).save();

    res.status(200).json(updateCommission);
  } catch (error) {
    console.error('Error updating Commission:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.post('/admin-register', async (req, res) => {
  try {
    const { email, password } = req.body;

    const newAdmin = new AdminRegister({ email, password });
    await newAdmin.save();

    res.status(201).json(newAdmin);
  } catch (error) {
    console.error('Error creating Admin:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/admin-login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate user input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await AdminRegister.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    res.json({
      success: true,
      message: 'Login successful',
      data: { id: user._id, email: user.email }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.patch('/admin-password', async (req, res) => {
  try {
    const { email, previous, newPassword } = req.body;

    const user = await AdminRegister.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Compare plain text passwords
    if (user.password !== previous) {
      return res.status(400).json({ message: 'Previous password does not match' });
    }

    // Update password
    const updatedUser = await AdminRegister.findOneAndUpdate(
      { email },
      { password: newPassword },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(500).json({ message: 'Password not updated' });
    }

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.get('/admin-login', async (req, res) => {
  try {
    const commission = await AdminRegister.find();
    res.status(200).json(commission);
  } catch (error) {
    console.error('Error fetching commission:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
