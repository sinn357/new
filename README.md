# My Site - Blog Platform

A modern blog platform built with Next.js 15, Prisma, and PostgreSQL.

## Features

- ✅ Create and view blog posts
- ✅ Add comments to posts
- ✅ Delete posts and comments
- ✅ Contact form with email sending
- ✅ Persistent data storage with PostgreSQL
- ✅ Server-side rendering
- ✅ Type-safe API routes
- ✅ Responsive design

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Email**: EmailJS for contact form
- **Deployment**: Vercel
- **Styling**: Tailwind CSS

## Database Setup

The application uses PostgreSQL as the database with Prisma as the ORM.

### Local Development

1. Set up your database URL in `.env`:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/mydb"
   ```

2. Run Prisma migrations:
   ```bash
   npx prisma db push
   npx prisma generate
   ```

### Cloud Deployment

For production deployment on Vercel:

1. Set up a cloud PostgreSQL database (Neon, Supabase, or Aiven)
2. Add `DATABASE_URL` environment variable in Vercel dashboard
3. The `vercel.json` configuration handles Prisma generation during build

## API Endpoints

- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create new post
- `GET /api/posts/[id]` - Get post by ID
- `DELETE /api/posts/[id]` - Delete post by ID
- `GET /api/comments?postId=[id]` - Get comments for a post
- `POST /api/comments` - Create new comment
- `DELETE /api/comments/[id]` - Delete comment by ID

## Contact Form Setup (EmailJS)

The contact form uses EmailJS to send emails directly from the client-side. To enable email sending:

### 1. Create EmailJS Account
1. Go to [EmailJS.com](https://www.emailjs.com/)
2. Sign up for a free account
3. Create a new email service (Gmail, Outlook, etc.)

### 2. Create Email Template
1. Go to Email Templates in your EmailJS dashboard
2. Create a new template with these variables:
   ```
   From: {{from_name}} ({{from_email}})
   Subject: [{{category}}] {{subject}}
   
   Message:
   {{message}}
   
   ---
   Sent from: {{to_name}}'s Blog Contact Form
   ```

### 3. Get Your Keys
1. **Service ID**: From your Email Services page
2. **Template ID**: From your Email Templates page  
3. **Public Key**: From your Account page

### 4. Update Environment Variables
Update your `.env` file:
```bash
NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_actual_service_id
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_actual_template_id
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_actual_public_key
```

### 5. Test the Contact Form
1. Fill out the contact form
2. Check your configured email for the message
3. If not configured, the form will simulate sending (success message without actual email)

### Template Variables Available:
- `{{from_name}}` - Sender's name
- `{{from_email}}` - Sender's email
- `{{subject}}` - Message subject
- `{{category}}` - Contact category (일반 문의, 협업 제안, etc.)
- `{{message}}` - Message content
- `{{to_name}}` - Recipient name (defaults to "Blog Owner")

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deployment Status

✅ **Local Database**: SQLite/PostgreSQL setup complete
✅ **API Routes**: All endpoints working
✅ **Frontend**: Post creation/viewing functional  
✅ **Comments**: Comment system working
🔄 **Cloud Database**: Ready for deployment with environment variables
🔄 **Production**: Ready for Vercel deployment

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

🤖 Generated with [Claude Code](https://claude.ai/code)