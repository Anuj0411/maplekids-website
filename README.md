# 🏫 Play School Website

A comprehensive web application for managing a play school with role-based access control, student management, financial tracking, photo gallery, event management, and attendance tracking.

## ✨ Features

### 🔐 **Authentication & User Management**
- **User Registration**: Sign up with role selection (Admin, Teacher, General)
- **Secure Login**: Firebase Authentication with email/password
- **Role-Based Access**: Different dashboards and permissions based on user role
- **Protected Routes**: Automatic redirection based on authentication status

### 👨‍💼 **Admin Dashboard**
- **Student Management**: Add, view, edit, and delete student records
- **Financial Records**: Track income and expenses with detailed categorization
- **Photo Gallery**: Upload and manage school photos with drag-and-drop
- **Event Management**: Create and manage school events with active/inactive status
- **User Management**: Create new user accounts for staff and parents
- **Comprehensive Overview**: Statistics, quick actions, and data visualization

### 👩‍🏫 **Teacher Dashboard**
- **Attendance Tracking**: Log student attendance (present, absent, late)
- **Class Management**: Select class and date for attendance
- **Student Overview**: View class-wise student lists
- **Read-Only Access**: View other school information without edit permissions

### 👨‍👩‍👧‍👦 **General User Dashboard**
- **Parent Portal**: Access child's progress and school information
- **School Calendar**: View upcoming events and activities
- **Communication**: Access school announcements and updates
- **Resources**: Educational materials and school policies

### 🏠 **Home Page**
- **Dynamic Events Banner**: Display active school events
- **Photo Gallery**: Showcase school activities and memories
- **School Information**: Features, programs, and contact details
- **Call-to-Action**: Easy navigation to sign up/sign in

## 🚀 **Technology Stack**

- **Frontend**: React 19 with TypeScript
- **Routing**: React Router DOM v7
- **Database**: Firebase Firestore (NoSQL)
- **Authentication**: Firebase Auth
- **Storage**: Firebase Storage (for photos)
- **Styling**: CSS3 with responsive design
- **State Management**: React Hooks + Context API

## 📱 **Responsive Design**

- **Mobile-First**: Optimized for mobile devices
- **Tablet Support**: Responsive layouts for medium screens
- **Desktop Experience**: Full-featured interface for larger screens
- **Touch-Friendly**: Optimized for touch interactions

## 🔥 **Firebase Integration**

This project uses Firebase as the backend service:

- **Firestore Database**: Store all application data
- **Authentication**: Secure user login and registration
- **Storage**: Handle photo uploads and file management
- **Real-time Updates**: Live data synchronization
- **Security Rules**: Role-based access control

### **Firebase Setup Required**

Before running the application, you need to:

1. **Create Firebase Project**: Set up a new Firebase project
2. **Enable Services**: Activate Authentication, Firestore, and Storage
3. **Configure Security**: Set up Firestore security rules
4. **Update Config**: Replace placeholder values in `src/firebase/config.ts`

📖 **Complete setup guide**: See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)

## 🛠️ **Installation & Setup**

### **Prerequisites**
- Node.js (v16 or higher)
- npm or yarn
- Firebase account

### **1. Clone Repository**
```bash
git clone <repository-url>
cd play-school-website
```

### **2. Install Dependencies**
```bash
npm install
```

### **3. Firebase Setup**
Follow the detailed guide in [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)

### **4. Start Development Server**
```bash
npm start
```

The application will open at `http://localhost:3000`

## 📊 **Database Schema**

### **Collections**

#### **Users**
```typescript
{
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  role: 'admin' | 'teacher' | 'general';
  createdAt: timestamp;
}
```

#### **Students**
```typescript
{
  id: string;
  firstName: string;
  lastName: string;
  class: 'play' | 'nursery' | 'lkg' | 'ukg' | '1st';
  age: number;
  parentName: string;
  parentPhone: string;
  address: string;
  admissionDate: string;
  photo?: string;
  createdAt: timestamp;
}
```

#### **Financial Records**
```typescript
{
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  date: string;
  receiptNumber?: string;
  createdAt: timestamp;
}
```

#### **Photos**
```typescript
{
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  uploadedAt: timestamp;
}
```

#### **Events**
```typescript
{
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  isActive: boolean;
  createdAt: timestamp;
}
```

#### **Attendance**
```typescript
{
  id: string;
  class: string;
  date: string;
  students: {
    studentId: string;
    studentName: string;
    status: 'present' | 'absent' | 'late';
    remarks?: string;
  }[];
  createdAt: timestamp;
}
```

## 🎨 **UI/UX Features**

### **Design System**
- **Color Scheme**: Yellow theme with green accents
- **Typography**: Clean, readable fonts
- **Icons**: Emoji and modern iconography
- **Animations**: Smooth transitions and hover effects

### **Interactive Elements**
- **Forms**: Real-time validation and error handling
- **Uploads**: Drag-and-drop file uploads
- **Navigation**: Intuitive tab-based interfaces
- **Feedback**: Success messages and loading states

### **Responsive Components**
- **Cards**: Adaptive layouts for different screen sizes
- **Tables**: Scrollable tables for mobile devices
- **Forms**: Stacked layouts on small screens
- **Navigation**: Collapsible menus for mobile

## 🔒 **Security Features**

### **Authentication**
- **Email/Password**: Secure user authentication
- **Session Management**: Automatic token handling
- **Password Requirements**: Minimum strength validation

### **Authorization**
- **Role-Based Access**: Different permissions per user role
- **Protected Routes**: Automatic redirection for unauthorized access
- **Data Isolation**: Users can only access appropriate data

### **Firebase Security Rules**
- **Collection-Level Security**: Role-based read/write permissions
- **User Data Protection**: Users can only access their own data
- **Admin Privileges**: Full access for administrators

## 📈 **Performance Optimizations**

### **Frontend**
- **Code Splitting**: Lazy loading of components
- **Optimized Images**: Compressed photo uploads
- **Efficient State**: Minimal re-renders with React hooks

### **Backend**
- **Indexed Queries**: Optimized Firestore queries
- **Batch Operations**: Efficient data operations
- **Real-time Updates**: Live data synchronization

## 🚀 **Deployment**

### **Firebase Hosting (Recommended)**
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

### **Other Platforms**
- **Vercel**: Easy deployment with Git integration
- **Netlify**: Drag-and-drop deployment
- **AWS S3**: Static website hosting

## 🔧 **Development**

### **Available Scripts**
```bash
npm start          # Start development server
npm run build      # Build for production
npm test           # Run tests
npm run eject      # Eject from Create React App
```

### **Code Structure**
```
src/
├── components/          # React components
│   ├── forms/          # Form components
│   ├── dashboards/     # Dashboard components
│   └── common/         # Shared components
├── contexts/           # React contexts
├── firebase/           # Firebase configuration & services
├── types/              # TypeScript type definitions
└── styles/             # CSS files
```

## 🧪 **Testing**

### **Manual Testing**
- **User Registration**: Test all user roles
- **Authentication**: Login/logout functionality
- **Data Operations**: CRUD operations for all entities
- **Responsive Design**: Test on different screen sizes

### **Automated Testing**
```bash
npm test               # Run test suite
npm run test:coverage  # Generate coverage report
```

## 📝 **Contributing**

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature-name`
3. **Commit changes**: `git commit -m 'Add feature'`
4. **Push to branch**: `git push origin feature-name`
5. **Submit pull request**

## 🐛 **Troubleshooting**

### **Common Issues**

#### **Firebase Connection Errors**
- Check Firebase configuration in `config.ts`
- Verify API keys and project settings
- Ensure Firebase services are enabled

#### **Authentication Issues**
- Check if Email/Password auth is enabled
- Verify user exists in Firebase Console
- Check browser console for error messages

#### **Permission Denied Errors**
- Review Firestore security rules
- Ensure user has appropriate role
- Check if collections exist

### **Getting Help**
- **Firebase Console**: Check service status and logs
- **Browser Console**: Look for JavaScript errors
- **Network Tab**: Check API request/response
- **Documentation**: Refer to Firebase docs

## 📚 **Resources**

### **Documentation**
- [Firebase Documentation](https://firebase.google.com/docs)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### **Tutorials**
- [Firebase Setup Guide](./FIREBASE_SETUP.md)
- [React Best Practices](https://react.dev/learn)
- [Firebase Security Rules](https://firebase.google.com/docs/firestore/security)

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- **Firebase Team**: For excellent backend services
- **React Team**: For the amazing frontend framework
- **Open Source Community**: For various libraries and tools

---

**🎉 Ready to build the future of education management!**

For support and questions, please open an issue in the repository.
