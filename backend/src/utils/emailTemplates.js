//  PLANTILLA: Añadido a un grupo
exports.addedToGroupTemplate = (
  userName,
  groupName,
  addedBy,
  groupUrl,
  logoUrl
) => {

  const textVersion = `
Hola ${userName},

Has sido añadido al grupo "${groupName}" por ${addedBy}.
Puedes ver el grupo aquí: ${groupUrl}

Divisor de Gastos © 2026
  `;

  const htmlVersion = `
  <div style="background:#0d0d0d; padding:20px; color:white;
              font-family:Arial; border-radius:12px;
              max-width:600px; margin:auto;">

    <div style="text-align:center; margin-bottom:20px;">
      <img src="${logoUrl}" alt="Logo"
           style="width:80px; border-radius:10px;" />
    </div>

    <h2 style="color:#4CAF50; text-align:center;">
      Has sido añadido a un grupo
    </h2>

    <p>Hola <strong>${userName}</strong>,</p>

    <p>
      Has sido añadido al grupo <strong>${groupName}</strong>
      por <strong>${addedBy}</strong>.
    </p>

    <p>Ahora puedes ver los gastos, balances y participar en el grupo.</p>

    <div style="text-align:center; margin-top:25px;">
      <a href="${groupUrl}"
         style="background:#4CAF50; padding:12px 20px;
                color:white; text-decoration:none;
                border-radius:8px; font-weight:bold;">
        Ver grupo
      </a>
    </div>

    <br>
    <p style="font-size:12px; opacity:0.7; text-align:center;">
      Divisor de Gastos © 2026
    </p>
  </div>
  `;

  return { html: htmlVersion, text: textVersion };
};



//  PLANTILLA: Nuevo gasto
exports.newExpenseTemplate = (
  userName,
  groupName,
  description,
  amount,
  createdBy,
  viewUrl,
  logoUrl
) => {

  const textVersion = `
Hola ${userName},

Se ha registrado un nuevo gasto en el grupo "${groupName}":

Descripción: ${description}
Monto: €${amount}
Registrado por: ${createdBy}

Puedes ver los detalles del gasto y el grupo aquí: ${viewUrl}

Divisor de Gastos © 2026
  `;

  const htmlVersion = `
  <div style="background:#0d0d0d; padding:20px; color:white;
              font-family:Arial; border-radius:12px;
              max-width:600px; margin:auto;">

    <div style="text-align:center; margin-bottom:20px;">
      <img src="${logoUrl}" alt="Logo"
           style="width:80px; border-radius:10px;" />
    </div>

    <h2 style="color:#4CAF50; text-align:center;">
      Nuevo gasto registrado
    </h2>

    <p>Hola <strong>${userName}</strong>,</p>

    <p>Se ha registrado un nuevo gasto en el grupo <strong>${groupName}</strong>:</p>

    <ul>
      <li><strong>Descripción:</strong> ${description}</li>
      <li><strong>Monto:</strong> €${amount}</li>
      <li><strong>Registrado por:</strong> ${createdBy}</li>
    </ul>

    <div style="text-align:center; margin-top:25px;">
      <a href="${viewUrl}"
         style="background:#4CAF50; padding:12px 20px;
                color:white; text-decoration:none;
                border-radius:8px; font-weight:bold;">
        Ver el grupo
      </a>
    </div>

    <br>
    <p style="font-size:12px; opacity:0.7; text-align:center;">
      Divisor de Gastos © 2026
    </p>
  </div>
  `;

  return { html: htmlVersion, text: textVersion };
};

//  PLANTILLA: Bienvenida tras registro
exports.welcomeRegisterTemplate = (userName, logoUrl) => {
  const textVersion = `
Hola ${userName},

¡Bienvenido a Divisor de Gastos!
Tu registro se ha completado correctamente y ya puedes empezar a crear grupos, añadir gastos y compartir balances con otras personas.

Si no has sido tú quien ha creado esta cuenta, puedes ignorar este mensaje.

Divisor de Gastos © 2026
  `;

  const htmlVersion = `
  <div style="background:#0d0d0d; padding:20px; color:white;
              font-family:Arial; border-radius:12px;
              max-width:600px; margin:auto;">

    <div style="text-align:center; margin-bottom:20px;">
      <img src="${logoUrl}" alt="Logo"
           style="width:80px; border-radius:10px;" />
    </div>

    <h2 style="color:#4CAF50; text-align:center;">
      ¡Bienvenido a Divisor de Gastos!
    </h2>

    <p>Hola <strong>${userName}</strong>,</p>

    <p>
      Tu registro se ha completado correctamente y ya puedes empezar a crear
      grupos, registrar gastos y compartir los balances con otras personas.
    </p>

    <p>
      Si quieres empezar, solo tienes que iniciar sesión en la aplicación y
      crear tu primer grupo.
    </p>

    <br>
    <p style="font-size:12px; opacity:0.7; text-align:center;">
      Divisor de Gastos © 2026
    </p>
  </div>
  `;

  return { html: htmlVersion, text: textVersion };
};

//  PLANTILLA: Recuperacion de contrasena
exports.passwordResetTemplate = (userName, resetUrl, logoUrl) => {
  const textVersion = `
Hola ${userName},

Hemos recibido una solicitud para restablecer tu contrasena en Divisor de Gastos.
Si has sido tu, entra en el siguiente enlace para elegir una nueva contrasena:

${resetUrl}

Si no has solicitado este cambio, puedes ignorar este mensaje.

Divisor de Gastos © 2026
  `;

  const htmlVersion = `
  <div style="background:#0d0d0d; padding:20px; color:white;
              font-family:Arial; border-radius:12px;
              max-width:600px; margin:auto;">

    <div style="text-align:center; margin-bottom:20px;">
      <img src="${logoUrl}" alt="Logo"
           style="width:80px; border-radius:10px;" />
    </div>

    <h2 style="color:#4CAF50; text-align:center;">
      Restablecer contrasena
    </h2>

    <p>Hola <strong>${userName}</strong>,</p>

    <p>
      Hemos recibido una solicitud para restablecer tu contrasena en
      <strong>Divisor de Gastos</strong>.
    </p>

    <p>
      Haz clic en el siguiente boton para elegir una nueva contrasena.
    </p>

    <div style="text-align:center; margin-top:25px;">
      <a href="${resetUrl}"
         style="background:#4CAF50; padding:12px 20px;
                color:white; text-decoration:none;
                border-radius:8px; font-weight:bold;">
        Restablecer contrasena
      </a>
    </div>

    <p style="word-break:break-all; font-size:12px; opacity:0.8; margin-top:20px;">
      ${resetUrl}
    </p>

    <br>
    <p style="font-size:12px; opacity:0.7; text-align:center;">
      Divisor de Gastos © 2026
    </p>
  </div>
  `;

  return { html: htmlVersion, text: textVersion };
};

//  PLANTILLA: Aviso de deuda liquidada
exports.debtSettledTemplate = (
  recipientName,
  creditorName,
  groupName,
  amount,
  groupUrl,
  logoUrl
) => {
  const textVersion = `
Hola ${recipientName},

Tu deuda de �${amount} en el grupo "${groupName}" ha sido marcada como pagada por ${creditorName}.

Puedes revisar el grupo aqu�:
${groupUrl}

Divisor de Gastos � 2026
  `;

  const htmlVersion = `
  <div style="background:#0d0d0d; padding:20px; color:white;
              font-family:Arial; border-radius:12px;
              max-width:600px; margin:auto;">

    <div style="text-align:center; margin-bottom:20px;">
      <img src="${logoUrl}" alt="Logo"
           style="width:80px; border-radius:10px;" />
    </div>

    <h2 style="color:#4CAF50; text-align:center;">
      Deuda liquidada
    </h2>

    <p>Hola <strong>${recipientName}</strong>,</p>

    <p>
      Tu deuda de <strong>�${amount}</strong> en el grupo
      <strong>${groupName}</strong> ha sido marcada como pagada por
      <strong>${creditorName}</strong>.
    </p>

    <p>
      Ya puedes entrar al grupo para ver el estado actualizado.
    </p>

    <div style="text-align:center; margin-top:25px;">
      <a href="${groupUrl}"
         style="background:#4CAF50; padding:12px 20px;
                color:white; text-decoration:none;
                border-radius:8px; font-weight:bold;">
        Ver grupo
      </a>
    </div>

    <br>
    <p style="font-size:12px; opacity:0.7; text-align:center;">
      Divisor de Gastos � 2026
    </p>
  </div>
  `;

  return { html: htmlVersion, text: textVersion };
};
