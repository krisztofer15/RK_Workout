# RK_Workout - Edzés Nyilvántartó Alkalmazás

<img src="assets/images/Logo.png" alt="RK_Workout Logo" width="200"/>

## Projekt Áttekintés

Az RK_Workout egy modern edzésnyilvántartó alkalmazás, amely segít a felhasználóknak nyomon követni edzéseiket, gyakorlataikat és fejlődésüket. Az alkalmazás React Native és Expo keretrendszerrel készült, Supabase adatbázissal a háttérben.

### Főbb Funkciók

- **Felhasználói fiók kezelése**: Regisztráció, bejelentkezés, profil kezelése
- **Gyakorlatok böngészése**: Különböző kategóriákba rendezett edzésgyakorlatok
- **Edzés nyilvántartás**: Gyakorlatok, ismétlések és időtartamok rögzítése
- **Időzítő**: Beépített időzítő a gyakorlatok végrehajtásához
- **Statisztikák**: Edzési előrehaladás és statisztikák megtekintése
- **Modern UI**: Animációk és haptikus visszajelzések a jobb felhasználói élményért

## Telepítés és Futtatás

### Előfeltételek

- Node.js (v16 vagy újabb)
- npm vagy yarn
- Expo CLI
- Android Studio (Android fejlesztéshez) vagy Xcode (iOS fejlesztéshez)

### Telepítés

1. Klónozd le a repository-t:

   ```bash
   git clone https://github.com/krisztofer15/RK_Workout.git
   cd RK_Workout
   ```

2. Telepítsd a függőségeket:

   ```bash
   npm install
   ```

### Futtatás

Az alkalmazás indítása fejlesztői módban:

```bash
npm start
# vagy
npx expo start
```

A megjelenő QR kódot beolvashatod az Expo Go alkalmazással (Android) vagy a kamera alkalmazással (iOS).

Specifikus platformon való futtatás:

```bash
# Android
npm run android

# iOS
npm run ios

# Web
npm run web
```

## Technológiai Stack

- **Frontend**: React Native, Expo
- **Navigáció**: Expo Router
- **Állapotkezelés**: React Context API
- **Backend**: Supabase (PostgreSQL adatbázis, Auth, Storage)
- **UI Komponensek**: React Native elemek, egyedi komponensek
- **Animációk**: React Native Animated, Expo Haptics

## Projekt Struktúra

```
RK_Workout/
├── app/                   # Alkalmazás képernyők és navigáció
│   ├── (auth)/            # Hitelesítési képernyők
│   ├── (main)/            # Fő alkalmazás képernyők
│   └── _layout.jsx        # Fő elrendezés és navigáció
├── assets/                # Képek, fontok és egyéb statikus fájlok
├── components/            # Újrafelhasználható komponensek
├── constants/             # Konstansok és konfigurációs fájlok
├── contexts/              # React Context-ek
├── helpers/               # Segédfüggvények
├── lib/                   # Külső könyvtárak konfigurációja (pl. Supabase)
└── services/              # API és adatszolgáltatások
```

## Kapcsolat

Készítette: [Kóczé Krisztofer](https://github.com/krisztofer15)

---

 2025 RK_Workout. Minden jog fenntartva.
