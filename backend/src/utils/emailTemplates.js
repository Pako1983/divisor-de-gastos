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

//  PLANTILLA: Aviso de deuda cobrada
exports.debtCollectedTemplate = (
  creditorName,
  debtorName,
  groupName,
  amount,
  groupUrl,
  logoUrl
) => {
  const textVersion = `
Hola ${creditorName},

${debtorName} ha confirmado el pago de una deuda de �${amount} en el grupo "${groupName}".

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
      Deuda cobrada
    </h2>

    <p>Hola <strong>${creditorName}</strong>,</p>

    <p>
      <strong>${debtorName}</strong> ha confirmado el pago de una deuda de
      <strong>�${amount}</strong> en el grupo <strong>${groupName}</strong>.
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

//  PLANTILLA: Usuario eliminado de un grupo
exports.removedFromGroupTemplate = (
  userName,
  groupName,
  removedBy,
  logoUrl
) => {
  const textVersion = `
Hola ${userName},

Has sido eliminado del grupo "${groupName}" por ${removedBy}.
Desde este momento ya no podras ver sus gastos ni balances.

Divisor de Gastos (c) 2026
  `;

  const htmlVersion = `
  <div style="background:#0d0d0d; padding:20px; color:white;
              font-family:Arial; border-radius:12px;
              max-width:600px; margin:auto;">

    <div style="text-align:center; margin-bottom:20px;">
      <img src="${logoUrl}" alt="Logo"
           style="width:80px; border-radius:10px;" />
    </div>

    <h2 style="color:#ff4f4f; text-align:center;">
      Has sido eliminado de un grupo
    </h2>

    <p>Hola <strong>${userName}</strong>,</p>

    <p>
      Has sido eliminado del grupo <strong>${groupName}</strong>
      por <strong>${removedBy}</strong>.
    </p>

    <p>
      Desde este momento ya no podras ver sus gastos ni balances.
    </p>

    <br>
    <p style="font-size:12px; opacity:0.7; text-align:center;">
      Divisor de Gastos (c) 2026
    </p>
  </div>
  `;

  return { html: htmlVersion, text: textVersion };
};

//  PLANTILLA: Grupo eliminado
exports.groupDeletedTemplate = (
  userName,
  groupName,
  deletedBy,
  logoUrl
) => {
  const textVersion = `
Hola ${userName},

El grupo "${groupName}" ha sido eliminado por ${deletedBy}.
Ya no estara disponible en tu cuenta.

Divisor de Gastos (c) 2026
  `;

  const htmlVersion = `
  <div style="background:#0d0d0d; padding:20px; color:white;
              font-family:Arial; border-radius:12px;
              max-width:600px; margin:auto;">

    <div style="text-align:center; margin-bottom:20px;">
      <img src="${logoUrl}" alt="Logo"
           style="width:80px; border-radius:10px;" />
    </div>

    <h2 style="color:#ff4f4f; text-align:center;">
      Grupo eliminado
    </h2>

    <p>Hola <strong>${userName}</strong>,</p>

    <p>
      El grupo <strong>${groupName}</strong> ha sido eliminado por
      <strong>${deletedBy}</strong>.
    </p>

    <p>
      Ya no estara disponible en tu cuenta.
    </p>

    <br>
    <p style="font-size:12px; opacity:0.7; text-align:center;">
      Divisor de Gastos (c) 2026
    </p>
  </div>
  `;

  return { html: htmlVersion, text: textVersion };
};

//  PLANTILLA: Invitacion para registrarse y unirse a un grupo
exports.groupInvitationTemplate = (
  email,
  groupName,
  invitedBy,
  registerUrl,
  logoUrl
) => {
  const textVersion = `
Hola,

${invitedBy} te ha invitado a unirte al grupo "${groupName}" en Divisor de Gastos.
Si aun no tienes cuenta, puedes registrarte aqui:
${registerUrl}

Una vez completes el registro, tu cuenta se asociara automaticamente al grupo.

Divisor de Gastos (c) 2026
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
      Invitacion para registrarte
    </h2>

    <p>Hola,</p>

    <p>
      <strong>${invitedBy}</strong> te ha invitado a unirte al grupo
      <strong>${groupName}</strong> en <strong>Divisor de Gastos</strong>.
    </p>

    <p>
      Si aun no tienes cuenta, puedes registrarte con este correo para unirte automaticamente al grupo.
    </p>

    <div style="text-align:center; margin-top:25px;">
      <a href="${registerUrl}"
         style="background:#4CAF50; padding:12px 20px;
                color:white; text-decoration:none;
                border-radius:8px; font-weight:bold;">
        Registrarme ahora
      </a>
    </div>

    <p style="word-break:break-all; font-size:12px; opacity:0.8; margin-top:20px;">
      ${registerUrl}
    </p>

    <br>
    <p style="font-size:12px; opacity:0.7; text-align:center;">
      Divisor de Gastos (c) 2026
    </p>
  </div>
  `;

  return { html: htmlVersion, text: textVersion };
};
