# Just A Note - Anonymous Dedication Platform

A beautiful web application for creating and sharing anonymous dedications with music, photos, and heartfelt messages.

## Features

- 🎵 **Music Integration** - Add songs from YouTube or Spotify
- 🎨 **7 Beautiful Themes** - Crush, Partner, Friend, Best Friend, Parents, Teacher, and Appreciation
- 📸 **Photo Upload** - Add personal photos to your dedications
- 👻 **100% Anonymous** - Option to send dedications anonymously
- 💌 **Direct Delivery** - Self-delivery or submit for Instagram DM delivery
- 📧 **Email Notifications** - Get notified when your dedication is viewed
- 📱 **Share to Instagram Stories** - Beautiful story cards optimized for Instagram

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Animations**: Framer Motion
- **Backend**: Firebase (Firestore + Authentication)
- **Email**: EmailJS
- **Deployment**: Firebase Hosting

## Installation

```sh
# Clone the repository
git clone https://github.com/aryster07/Anon-Web.git

# Navigate to project directory
cd Anon-Web

# Install dependencies
npm install

# Start development server
npm run dev
```

## Environment Variables

Create a `.env` file in the root directory with your Firebase and EmailJS credentials:

```env
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
VITE_EMAILJS_VIEWED_TEMPLATE_ID=your_viewed_template_id
```

## Build for Production

```sh
npm run build
```

## Deploy to Firebase

```sh
firebase deploy
```

## Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── steps/       # Multi-step form components
│   └── ui/          # shadcn/ui components
├── lib/             # Utilities and services
│   ├── firebase.ts  # Firebase configuration
│   ├── themes.ts    # Theme definitions
│   └── ...
├── pages/           # Route pages
│   ├── LandingPage.tsx
│   ├── CreatePage.tsx
│   ├── ViewPage.tsx
│   └── ...
└── App.tsx          # Main app component
```

## License

MIT

## Credits

Made with 💛 by 7Frames_aryan
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
