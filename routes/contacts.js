const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { check, body, validationResult } = require("express-validator");

const User = require("../models/User");
const Contact = require("../models/Contacts");

// @route GET api/contacts/all
// @desc Get all users contact

router.get("/all", auth, async (req, res) => {
  try {
    const contacts = await Contact.find({ user: req.user.id }).sort({
      date: -1,
    });
    res.json(contacts);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});

// @route POST api/contacts/add
// @desc Add new contact
router.post(
  "/add",
  [auth, [check("name", "Name is required").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, phone, addrress, city, state, country, pincode } =
      req.body;
    try {
      const newContact = new Contact({
        name,
        email,
        phone,
        addrress,
        city,
        state,
        country,
        pincode,
        user: req.user.id,
      });
      const contact = await newContact.save();
      res.json(contact);
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route PUT api/contacts/update/:id
// @desc Update contact
// @access Private
router.put("/update/:id", auth, async (req, res) => {
  const { name, email, phone, addrress, city, state, country, pincode } =
    req.body;

  // Build contact object
  const contactField = {};
  if (name) contactField.name = name;
  if (email) contactField.email = email;
  if (phone) contactField.phone = phone;
  if (addrress) contactField.phone = addrress;
  if (city) contactField.phone = city;
  if (state) contactField.phone = state;
  if (country) contactField.phone = country;
  if (pincode) contactField.phone = pincode;

  try {
    let contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ msg: "Contact not found" });

    // Make sure user owns contact
    if (contact.user.toString() !== req.user.id) {
      return res.status(404).json({ msg: "Not authorized" });
    }

    contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { $set: contactField },
      { new: true }
    );

    res.json(contact);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});

// @route DELETE api/contacts/delete/:id
// @desc delete contact
router.delete("/delete/:id", auth, async (req, res) => {
  try {
    let contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ msg: "Contact not found" });

    // Make sure user owns contact
    if (contact.user.toString() !== req.user.id) {
      return res.status(404).json({ msg: "Not authorized" });
    }

    await Contact.findByIdAndRemove(req.params.id);

    res.json({ msg: "Contact removed" });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});
module.exports = router;
