
import { sql } from "../../config/db.js";
import { generateInquiryId, generateReservationId } from "../../utils/generateId.js";
import { isEmail, optStr, str } from "../../utils/validate.js";

// POST /api/public/reservations
export async function createReservation(req, res) {
  try {
    // hidden "website" field: real people leave it empty, form-filling bots do not
    if (str(req.body?.website)) return res.status(201).json({ message: "Reservation request received", reference: "BNB-0000-000" });

    const full_name = str(req.body?.full_name, 120);
    const phone = str(req.body?.phone, 20).replace(/[^\d+]/g, "");
    const email = str(req.body?.email, 160).toLowerCase();
    const branch_name = str(req.body?.branch_name, 160);
    const visit_date = str(req.body?.visit_date, 10);
    const visit_time = str(req.body?.visit_time, 10);
    const guests = Math.round(Number(req.body?.guests));
    const duration = optStr(req.body?.duration, 40);
    const note = optStr(req.body?.note, 600);

    if (!full_name) return res.status(400).json({ error: "Please enter your full name." });
    if (phone.replace(/\D/g, "").length < 10) return res.status(400).json({ error: "Please enter a valid mobile number." });
    if (!isEmail(email)) return res.status(400).json({ error: "Please enter a valid email address." });
    if (!branch_name) return res.status(400).json({ error: "Please choose a branch." });
    if (!/^\d{4}-\d{2}-\d{2}$/.test(visit_date)) return res.status(400).json({ error: "Please choose a visit date." });
    if (!/^\d{1,2}:\d{2}$/.test(visit_time)) return res.status(400).json({ error: "Please choose a time." });
    if (!Number.isInteger(guests) || guests < 1 || guests > 30) return res.status(400).json({ error: "Guests must be between 1 and 30." });

    const reservation_id = await generateReservationId();
    await sql`INSERT INTO reservations (reservation_id, full_name, phone, email, branch_name, visit_date, visit_time, guests, duration, note)
      VALUES (${reservation_id}, ${full_name}, ${phone}, ${email}, ${branch_name}, ${visit_date}, ${visit_time}, ${guests}, ${duration}, ${note})`;

    res.status(201).json({ message: "Reservation request received", reference: reservation_id });
  } catch (err) {
    console.error("createReservation:", err);
    res.status(500).json({ error: "Could not send your reservation request. Please try again." });
  }
}

// POST /api/public/inquiries
export async function createInquiry(req, res) {
  try {
    if (str(req.body?.website)) return res.status(201).json({ message: "Message sent" });

    const full_name = str(req.body?.full_name, 120);
    const email = str(req.body?.email, 160).toLowerCase();
    const topic = optStr(req.body?.topic, 80);
    const message = str(req.body?.message, 3000);

    if (!full_name || !isEmail(email) || !message) {
      return res.status(400).json({ error: "Please fill in all required fields with valid information." });
    }

    const inquiry_id = await generateInquiryId();
    await sql`INSERT INTO inquiries (inquiry_id, full_name, email, topic, message)
      VALUES (${inquiry_id}, ${full_name}, ${email}, ${topic}, ${message})`;

    res.status(201).json({ message: "Message sent" });
  } catch (err) {
    console.error("createInquiry:", err);
    res.status(500).json({ error: "Could not send your message. Please try again." });
  }
}
