require("dotenv").config();
const express = require("express");
const path = require("path");
const nodemailer = require("nodemailer");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Destino fijo de todos los formularios del sitio
const EMAIL_TO = process.env.EMAIL_TO || "soporte.aban@gmail.com";

// Transportador de correo (Gmail + contraseña de aplicación).
// Configura EMAIL_USER y EMAIL_PASS en tu archivo .env (ver .env.example)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

app.post("/enviar-contacto", async (req, res) => {
  const { nombre, correo, telefono, curso, fecha, horario, asunto, mensaje, tipo } = req.body;

  if (!nombre || !correo) {
    return res.status(400).json({ ok: false, error: "Nombre y correo son obligatorios." });
  }

  const lineas = [
    `Tipo de solicitud: ${tipo || "Contacto"}`,
    `Nombre: ${nombre}`,
    `Correo: ${correo}`,
    telefono ? `Teléfono: ${telefono}` : null,
    curso ? `Curso de interés: ${curso}` : null,
    fecha ? `Fecha preferida: ${fecha}` : null,
    horario ? `Horario preferido: ${horario}` : null,
    asunto ? `Asunto: ${asunto}` : null,
    mensaje ? `Mensaje:\n${mensaje}` : null,
  ].filter(Boolean);

  const mailOptions = {
    from: `"Sitio Web Grupo ABAN" <${process.env.EMAIL_USER}>`,
    to: EMAIL_TO,
    replyTo: correo,
    subject: `[Sitio Web] ${tipo || "Contacto"} — ${nombre}`,
    text: lineas.join("\n"),
  };

  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn("⚠️  EMAIL_USER / EMAIL_PASS no configurados. Revisa tu archivo .env");
      console.log("Contenido que se habría enviado:\n" + mailOptions.text);
      return res.status(200).json({ ok: true, warning: "Correo no configurado; mensaje solo registrado en consola." });
    }

    await transporter.sendMail(mailOptions);
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Error enviando correo:", err.message);
    res.status(500).json({ ok: false, error: "No se pudo enviar el correo." });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Grupo ABAN corriendo en http://localhost:${PORT}`);
});
