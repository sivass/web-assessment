# Web Assessment - Next.js Authentication System

A comprehensive authentication system built with Next.js 15, featuring multi-factor authentication (MFA), secure word validation, and transaction management.

## 🚀 Quick Start

### Prerequisites
- Node.js (version 18 or higher)
- npm, yarn, or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/sivass/web-assessment
cd web-assessment

# Install dependencies
npm install

# Create environment file
echo "SECRET_KEY=your-secret-key-here" > .env.local

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔐 Demo Credentials

For testing the authentication flow:

- **Username**: Any username (e.g., `demo`)
- **Secure Word**: Generated automatically (60-second expiration)
- **Password**: Any password (demo mode)
- **MFA Code**: `123456`

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## 📁 Key Features

- **Multi-Step Authentication**: Username → Secure Word → Password → MFA
- **Security**: Rate limiting, attempt tracking, automatic lockouts
- **Responsive Design**: Mobile-first with Tailwind CSS
- **Transaction Dashboard**: Protected transaction history
- **Session Management**: Automatic login state handling

## 🛠️ Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run linting
npm test         # Run tests
```

