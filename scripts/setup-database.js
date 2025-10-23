/**
 * JavaScript Version des Setup-Scripts (falls TypeScript-Ausführung Probleme macht)
 * Führt Schema aus und erstellt Test-Benutzer
 * 
 * Verwendung: node scripts/setup-database.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Environment Variables prüfen
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Fehler: NEXT_PUBLIC_SUPABASE_URL und SUPABASE_SERVICE_ROLE_KEY müssen gesetzt sein!');
  console.error('\nBitte .env.local Datei erstellen mit:');
  console.error('NEXT_PUBLIC_SUPABASE_URL=https://stjjipfihjqsvrjnkrfn.supabase.co');
  console.error('SUPABASE_SERVICE_ROLE_KEY=<ihr-service-role-key>');
  process.exit(1);
}

// Supabase Client mit Service Role (Admin-Rechte)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const TEST_USERS = [
  {
    email: 'admin@example.com',
    password: 'wlo2025!',
    role: 'admin',
    fullName: 'Administrator',
  },
  {
    email: 'sozial1@example.com',
    password: 'wlo2025!',
    role: 'social_worker',
    fullName: 'Sozialarbeiter 1',
  },
];

function extractProjectId(url) {
  const match = url.match(/https:\/\/([^.]+)\.supabase\.co/);
  return match ? match[1] : '';
}

async function checkSchema() {
  console.log('\n📄 Prüfe Datenbank-Schema...');
  
  try {
    const { data: profiles } = await supabase.from('profiles').select('count').limit(1);
    const { data: clients } = await supabase.from('clients').select('count').limit(1);
    
    if (profiles !== null && clients !== null) {
      console.log('✅ Datenbank-Tabellen existieren bereits');
      return true;
    }
    
    console.log('⚠️  Einige Tabellen fehlen. Bitte führen Sie schema.sql manuell aus:');
    console.log(`   https://supabase.com/dashboard/project/${extractProjectId(supabaseUrl)}/sql/new`);
    console.log('\nOder kopieren Sie den Inhalt von: supabase/schema.sql');
    
    return false;
  } catch (error) {
    console.error('❌ Fehler beim Prüfen des Schemas:', error.message);
    return false;
  }
}

async function createTestUsers() {
  console.log('\n👥 Erstelle Test-Benutzer...\n');

  for (const user of TEST_USERS) {
    console.log(`\n▶️  Erstelle: ${user.email} (${user.role})`);

    // Prüfe ob Benutzer bereits existiert
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('email')
      .eq('email', user.email)
      .single();

    if (existingProfile) {
      console.log(`   ℹ️  Benutzer existiert bereits - überspringe`);
      continue;
    }

    try {
      // Benutzer in Supabase Auth erstellen
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
      });

      if (authError) {
        console.error(`   ❌ Auth-Fehler: ${authError.message}`);
        continue;
      }

      if (!authData.user) {
        console.error(`   ❌ Kein User-Objekt erhalten`);
        continue;
      }

      console.log(`   ✅ Auth-User erstellt (ID: ${authData.user.id})`);

      // Profil in Datenbank erstellen
      const { error: profileError } = await supabase.from('profiles').insert({
        id: authData.user.id,
        email: user.email,
        role: user.role,
        full_name: user.fullName,
      });

      if (profileError) {
        console.error(`   ❌ Profil-Fehler: ${profileError.message}`);
        
        // Cleanup: Lösche Auth-User wenn Profil fehlschlägt
        await supabase.auth.admin.deleteUser(authData.user.id);
        console.log(`   🔄 Auth-User wurde gelöscht (Rollback)`);
        continue;
      }

      console.log(`   ✅ Profil erstellt`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   🔑 Passwort: ${user.password}`);
    } catch (error) {
      console.error(`   ❌ Unerwarteter Fehler:`, error.message);
    }
  }
}

async function verifySetup() {
  console.log('\n\n🔍 Verifiziere Setup...\n');

  // Prüfe Tabellen
  const tables = ['profiles', 'clients', 'sessions', 'reports', 'progress_indicators'];
  
  for (const table of tables) {
    try {
      const { error } = await supabase.from(table).select('count').limit(1);
      if (error) {
        console.log(`   ❌ Tabelle '${table}': Nicht gefunden`);
      } else {
        console.log(`   ✅ Tabelle '${table}': OK`);
      }
    } catch (error) {
      console.log(`   ❌ Tabelle '${table}': Fehler`);
    }
  }

  // Prüfe Benutzer
  console.log('\n👥 Benutzer:');
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('email, role, full_name');

  if (profilesError) {
    console.log(`   ❌ Fehler beim Laden: ${profilesError.message}`);
  } else if (profiles && profiles.length > 0) {
    profiles.forEach((profile) => {
      console.log(`   ✅ ${profile.email} (${profile.role}) - ${profile.full_name}`);
    });
  } else {
    console.log(`   ⚠️  Keine Benutzer gefunden`);
  }
}

async function main() {
  console.log('🚀 Datenbank-Setup gestartet\n');
  console.log('📍 Supabase URL:', supabaseUrl);
  console.log('🔑 Service Role Key:', supabaseServiceKey ? '✅ Gesetzt' : '❌ Fehlt');

  // Schritt 1: Schema prüfen
  const schemaExists = await checkSchema();

  if (!schemaExists) {
    console.log('\n⚠️  WICHTIG: Führen Sie zuerst das Schema manuell aus!');
    console.log('\n1. Öffnen Sie: https://supabase.com/dashboard/project/' + extractProjectId(supabaseUrl) + '/sql/new');
    console.log('2. Kopieren Sie den Inhalt von: supabase/schema.sql');
    console.log('3. Klicken Sie "Run"\n');
    console.log('Danach können Sie dieses Script erneut ausführen.\n');
  }

  // Schritt 2: Test-Benutzer erstellen
  await createTestUsers();

  // Schritt 3: Verifizierung
  await verifySetup();

  console.log('\n\n✨ Setup abgeschlossen!\n');
  console.log('🔐 Login-Credentials:');
  console.log('━'.repeat(50));
  TEST_USERS.forEach((user) => {
    console.log(`${user.role === 'admin' ? '👑' : '👤'} ${user.role.toUpperCase()}`);
    console.log(`   Email:    ${user.email}`);
    console.log(`   Passwort: ${user.password}`);
    console.log('');
  });
  console.log('🌐 App starten: npm run dev');
  console.log('📱 Dann öffnen: http://localhost:3000\n');
}

main().catch((error) => {
  console.error('\n❌ Fataler Fehler:', error);
  process.exit(1);
});
