const { v4 } = require("uuid");
const transporter = require("./nodemailer.config.js");
const fs = require("fs");
const { json } = require("express");

async function sendEmailCode(req, res) {
  try {
    const { userEmail, prize } = req.body;
    if (isEmailUsed(userEmail)) {
      res.status(400).json({ msg: "Ya haz recibido un premio" });
      return;
    }
    const code = v4().slice(0, 4);
    const expired = fechaDentroDeUnMes();
    await send(userEmail, code, expired, prize);
    saveAndGenCode(code, userEmail, prize);
    res.status(200).json({ ok: true, msg: "Codigo enviado" });
  } catch (err) {
    console.log(err);
    res.status(400).json({ msg: "Email invalido o servicio caido" });
  }
}

async function send(userEmail, code, expired, prize) {
  await transporter.sendMail({
    from: "capillaencuestas@gmail.com",
    to: userEmail,
    subject: "Codigo promocional",
    html: `<html><h5>Este es tu código de descuento:</h5>
                  <h1>${code}</h1>
                  <h2>${prize}</h2>
                  <h3>Valido hasta:${expired}</h3>
                  <h5>Recuerda que solo se puede canjear una vez</h5>
                  </html>
              `,
  });
}

//utilities
function fechaDentroDeUnMes() {
  // Obtener la fecha actual
  let fechaActual = new Date();

  // Sumar un mes a la fecha actual
  fechaActual.setMonth(fechaActual.getMonth() + 1);

  // Obtener día, mes y año
  let dia = fechaActual.getDate();
  let mes = fechaActual.getMonth() + 1; // Sumar 1 porque los meses en JavaScript son indexados desde 0
  let anio = fechaActual.getFullYear() % 100; // Obtener los dos últimos dígitos del año

  // Formatear la fecha
  let fechaFormateada = `${dia < 10 ? "0" : ""}${dia}/${
    mes < 10 ? "0" : ""
  }${mes}/${anio}`;

  return fechaFormateada;
}

function saveAndGenCode(str, userEmail, prize) {
  //generates data to save in db
  const code = { userEmail: userEmail, prize: prize, code: str, used: false };
  const currentData = JSON.parse(fs.readFileSync("./db/db.json", "utf8"));
  const newData = [...currentData, code];
  fs.writeFileSync("./db/db.json", JSON.stringify(newData), (err) =>
    console.log(err)
  );
}

function isEmailUsed(userEmail) {
  const data = JSON.parse(fs.readFileSync("./db/db.json"));
  const used = data.find((code) => code.userEmail == userEmail);
  if (used) return true;
}

module.exports = { sendEmailCode };
