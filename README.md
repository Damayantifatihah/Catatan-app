# Catatan App

Aplikasi Catatan + To-Do (Expo, React Navigation, Supabase, Zustand).

## Struktur Folder

src/
├── components/   Komponen UI reusable. Tanpa logic data.
├── constants/    Warna, ukuran font, dan config (URL Supabase). Jangan hardcode di tempat lain.
├── hooks/        Custom hooks per fitur (useAuth, useNotes, useTodos): panggil service, kelola loading/error.
├── screens/      Halaman (LoginScreen, NotesScreen, TodoScreen). Hanya memanggil hooks dan menyusun components.
├── services/     Satu-satunya tempat yang boleh akses Supabase (supabase.js, authService, noteService, todoService).
├── store/        State global Zustand (useTodoStore, useThemeStore).
└── utils/        Fungsi bantu.

## Alur Data

Screen -> Hook -> Service -> Supabase
                    |
                    +-> Store (Zustand, khusus Todo dan tema)

## Aturan Tim

- Dilarang `import supabase` di `screens/` atau `components/`.
- Warna, ukuran font, dan URL wajib diambil dari `constants/`.
- Fitur baru = buat service + hook + screen.

## Menjalankan

npm install
npx expo start