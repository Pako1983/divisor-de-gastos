// ===============================
//  PLANTILLA: Añadido a un grupo
// ===============================
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


// ===============================
//  PLANTILLA: Nuevo gasto
// ===============================
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


