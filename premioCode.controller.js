const { v4 } = require("uuid");
const transporter = require("./nodemailer.config.js");
const fs = require("fs");
const { json } = require("express");

function verifyPremioCode(req, res) {
  try {
    const { premioCode } = req.params;
    const data = JSON.parse(fs.readFileSync("./db/db.json"));
    const code = data.find((code) => code.code == premioCode);
    if (code) {
      !code.used
        ? useCode(data, code, res)
        : res.status(400).send("Ya fue utilizado");
    } else {
      res.status(400).send("El codigo no existe");
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Algo salio mal");
  }
}

function useCode(data, code, res) {
  try {
    const newArr = data.filter((obj) => obj !== code);
    code.used = true;
    const newData = [...newArr, code];
    fs.writeFileSync("./db/db.json", JSON.stringify(newData));
    res.status(200).send("Canjeado con exito");
  } catch (err) {
    console.log(err);
  }
}

async function sendEmailCode(req, res) {
  try {
    const { userEmail } = req.body;
    if (isEmailUsed(userEmail)) {
      res.status(400).send("Ya haz reclamado tu premio");
      return;
    }
    const code = v4().slice(0, 4);
    const expired = fechaDentroDeUnMes();
    await send(userEmail, code, expired);
    saveAndGenCode(code, userEmail);
    res.status(200).send("sent");
  } catch (err) {
    console.log(err);
    res.status(400).send("Email invalido o servicio caido");
  }
}

async function send(userEmail, code, expired) {
  await transporter.sendMail({
    from: "capillaencuestas@gmail.com",
    to: userEmail,
    subject: "Codigo promocional",
    html: `<html><h5>Este es tu código de descuento:</h5>
                  <h1>${code}</h1>
                  <h3>Valido hasta:${expired}</h3>
                  <h5>Recuerda que solo se puede canjear una vez</h5>
                  </html>
              `,
  });
}

//utilitie
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

function saveAndGenCode(str, userEmail) {
  const code = { userEmail: userEmail, code: str, used: false };
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

module.exports = { verifyPremioCode, sendEmailCode };
