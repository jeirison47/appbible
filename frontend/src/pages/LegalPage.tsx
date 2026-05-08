import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

type Tab = 'privacy' | 'terms' | 'attribution';

export default function LegalPage() {
  const [activeTab, setActiveTab] = useState<Tab>('privacy');
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const tabs: { id: Tab; label: string }[] = [
    { id: 'privacy', label: 'Privacidad' },
    { id: 'terms', label: 'Términos de Uso' },
    { id: 'attribution', label: 'Atribución' },
  ];

  return (
    <div className="min-h-screen bg-manah-bg font-manrope">
      {/* Header */}
      <div className="bg-manah-card border-b border-manah-gold/20">
        <div className="max-w-3xl mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-manah-cream">Legal</h1>
            <p className="text-manah-muted text-sm mt-0.5">Información legal de Manah</p>
          </div>
          <Link
            to={isAuthenticated ? '/inicio' : '/'}
            className="flex items-center gap-2 text-manah-muted hover:text-manah-gold transition text-sm font-medium cursor-pointer"
          >
            <span className="text-lg">←</span>
            Volver
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-1 bg-manah-card rounded-xl p-1 shadow mb-6 border border-manah-gold/10">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 px-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-manah-gold text-manah-bg shadow'
                  : 'text-manah-muted hover:bg-manah-deep'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-manah-card rounded-xl shadow border border-manah-gold/10 p-6 space-y-6 text-manah-muted text-sm leading-relaxed">

          {activeTab === 'privacy' && (
            <>
              <div>
                <h2 className="text-lg font-bold text-manah-cream mb-1">Política de Privacidad</h2>
                <p className="text-xs text-manah-muted/60">Última actualización: mayo 2025</p>
              </div>

              <Section title="1. Información que recopilamos">
                <p>Al crear una cuenta recopilamos:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Dirección de correo electrónico</li>
                  <li>Nombre de perfil (el que tú proporciones)</li>
                  <li>Contraseña (almacenada encriptada con bcrypt; nunca en texto plano)</li>
                </ul>
                <p className="mt-2">Durante el uso de la app registramos:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Progreso de lectura (capítulos y libros leídos)</li>
                  <li>Racha de días, nivel y puntos de experiencia (XP)</li>
                  <li>Meta diaria y tiempo de lectura acumulado</li>
                  <li>Versión bíblica seleccionada como preferencia</li>
                </ul>
              </Section>

              <Section title="2. Cómo usamos tu información">
                <ul className="list-disc list-inside space-y-1">
                  <li>Para mostrarte tu progreso personal dentro de la app</li>
                  <li>Para calcular rachas, XP, niveles y metas</li>
                  <li>Para mantener tu sesión activa</li>
                </ul>
                <p className="mt-2">No vendemos ni compartimos tu información con terceros con fines comerciales o publicitarios.</p>
              </Section>

              <Section title="3. Servicios de terceros">
                <p>Manah utiliza los siguientes servicios externos:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li><strong className="text-manah-cream">Auth0</strong> — para inicio de sesión con Google (solo si lo usas)</li>
                  <li><strong className="text-manah-cream">Neon DB</strong> — base de datos PostgreSQL donde se almacenan tus datos</li>
                  <li><strong className="text-manah-cream">Render</strong> — servidor backend (alojamiento)</li>
                  <li><strong className="text-manah-cream">Vercel</strong> — frontend (alojamiento)</li>
                </ul>
                <p className="mt-2">Cada uno de estos servicios tiene su propia política de privacidad.</p>
              </Section>

              <Section title="4. Retención y eliminación de datos">
                <p>Tus datos se conservan mientras tu cuenta esté activa. Si deseas eliminar tu cuenta y todos tus datos, contáctanos.</p>
              </Section>

              <Section title="5. Seguridad">
                <p>Las contraseñas se almacenan cifradas. La comunicación entre la app y el servidor utiliza HTTPS. Sin embargo, ningún sistema es 100% seguro y no podemos garantizar seguridad absoluta.</p>
              </Section>

              <Section title="6. Contacto">
                <p>Para consultas sobre privacidad escríbenos a: <span className="font-medium text-manah-gold">jeirison47@gmail.com</span></p>
              </Section>
            </>
          )}

          {activeTab === 'terms' && (
            <>
              <div>
                <h2 className="text-lg font-bold text-manah-cream mb-1">Términos de Uso</h2>
                <p className="text-xs text-manah-muted/60">Última actualización: mayo 2025</p>
              </div>

              <Section title="1. Naturaleza de la aplicación">
                <p>Manah es un proyecto personal de carácter no comercial. No está afiliado a ninguna organización religiosa, editorial bíblica ni empresa. Se provee "tal como está", sin garantías de disponibilidad continua.</p>
              </Section>

              <Section title="2. Uso aceptable">
                <p>Al usar Manah aceptas:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Usar la app únicamente con fines personales</li>
                  <li>No intentar acceder a cuentas ajenas ni vulnerar la seguridad del sistema</li>
                  <li>No usar la app para distribuir o reproducir masivamente los textos bíblicos que contiene</li>
                  <li>Ser responsable de mantener la confidencialidad de tus credenciales</li>
                </ul>
              </Section>

              <Section title="3. Contenido bíblico">
                <p>Los textos bíblicos disponibles en la app son propiedad de sus respectivos titulares de derechos (American Bible Society, Biblica, Tyndale House, entre otros). Su uso en esta app es de carácter personal y educativo, sin fines comerciales. No se otorga ningún derecho de reproducción masiva sobre dichos textos.</p>
              </Section>

              <Section title="4. Disponibilidad del servicio">
                <p>Manah puede estar no disponible en cualquier momento por mantenimiento, errores técnicos u otras razones. No nos hacemos responsables por pérdida de datos o interrupciones del servicio.</p>
              </Section>

              <Section title="5. Modificaciones">
                <p>Estos términos pueden actualizarse en cualquier momento. El uso continuado de la app implica aceptación de los términos vigentes.</p>
              </Section>

              <Section title="6. Limitación de responsabilidad">
                <p>En ningún caso el desarrollador será responsable por daños directos, indirectos, incidentales o consecuentes derivados del uso o imposibilidad de uso de la aplicación.</p>
              </Section>
            </>
          )}

          {activeTab === 'attribution' && (
            <>
              <div>
                <h2 className="text-lg font-bold text-manah-cream mb-1">Atribución de Versiones Bíblicas</h2>
                <p className="text-xs text-manah-muted/60">Manah es un proyecto personal sin fines comerciales</p>
              </div>

              <p>Los textos bíblicos utilizados en esta aplicación pertenecen a sus respectivos titulares de derechos. Manah no reclama ningún derecho sobre estos textos.</p>

              <div className="space-y-3">
                <AttributionItem
                  version="RVR1960 — Reina-Valera 1960"
                  owner="© Sociedades Bíblicas en América Latina, 1960. Renovado © Sociedades Bíblicas Unidas, 1988."
                />
                <AttributionItem
                  version="NVI — Nueva Versión Internacional"
                  owner="© 1999, 2005, 2017 Biblica, Inc.® Usado con permiso."
                />
                <AttributionItem
                  version="NTV — Nueva Traducción Viviente"
                  owner="© 2010 Tyndale House Foundation."
                />
                <AttributionItem
                  version="TLA — Traducción en Lenguaje Actual"
                  owner="© 2000, 2002, 2004 Sociedades Bíblicas Unidas."
                />
                <AttributionItem
                  version="KJV — King James Version"
                  owner="Dominio público en Estados Unidos (publicada en 1611)."
                />
                <AttributionItem
                  version="NIV — New International Version"
                  owner="© 1973, 1978, 1984, 2011 Biblica, Inc.® Usado con permiso."
                />
                <AttributionItem
                  version="NLT — New Living Translation"
                  owner="© 1996, 2004, 2015 Tyndale House Foundation."
                />
                <AttributionItem
                  version="ESV — English Standard Version"
                  owner="© 2001 Crossway, una editorial de Good News Publishers."
                />
              </div>

              <div className="mt-4 p-4 bg-manah-deep rounded-xl border border-manah-gold/20">
                <p className="text-xs text-manah-muted">
                  Esta aplicación es un proyecto personal sin fines comerciales ni lucrativos. El uso del contenido bíblico tiene carácter exclusivamente personal y educativo. Si eres titular de derechos y tienes alguna observación, contáctanos en <span className="font-semibold text-manah-gold">jeirison47@gmail.com</span>.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-bold text-manah-cream mb-2">{title}</h3>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function AttributionItem({ version, owner }: { version: string; owner: string }) {
  return (
    <div className="p-3 bg-manah-deep rounded-xl border border-manah-gold/15">
      <p className="font-semibold text-manah-cream text-sm">{version}</p>
      <p className="text-xs text-manah-muted mt-0.5">{owner}</p>
    </div>
  );
}



