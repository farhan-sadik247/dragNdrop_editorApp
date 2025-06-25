
# Mini Design Editor App 📱

A powerful React Native design editor app that allows users to create stunning designs with text, images, and shapes. Built with modern technologies for smooth performance and intuitive user experience.

## 🎯 Motive

This project was developed as part of a React Native internship assessment to demonstrate proficiency in:

- Canvas manipulation and drawing  
- Gesture handling for interactive elements  
- Image processing and media management  
- Modern React Native development practices  
- Performance optimization with advanced rendering libraries  

The goal was to create a mini version of popular design apps like Canva or Adobe Creative Suite, focusing on core functionality while maintaining excellent performance on mobile devices.

## 🛠️ Technologies Used

### Core Framework
- **React Native** – Cross-platform mobile development  
- **Expo** – Development platform and tooling  
- **TypeScript** – Type-safe JavaScript development  

### Canvas & Drawing
- **@shopify/react-native-skia** – High-performance 2D graphics rendering  
- **react-native-svg** – SVG support for shape previews  

### Gesture & Animation
- **react-native-gesture-handler** – Advanced gesture recognition  
- **react-native-reanimated** – Smooth 60fps animations  

### Media & Storage
- **expo-image-picker** – Gallery and camera access  
- **react-native-view-shot** – Canvas screenshot capture  
- **expo-media-library** – Save images to device gallery  

### UI & Navigation
- **react-native-safe-area-context** – Safe area handling  
- **expo-router** – File-based routing system  

## ✨ Features

### Core Functionality
- 📝 **Text Addition** – Add custom text with different styles (Heading, Subtitle, Normal)  
- 🖼️ **Image Integration** – Pick images from gallery and add to canvas  
- 🔷 **Shape Creation** – Add various shapes (Circle, Triangle, Rectangle, Star, Hexagon)  
- 👆 **Gesture Controls** – Drag to move, pinch to resize any element  
- 💾 **Export Design** – Save final design as PNG to device gallery  

### Advanced Features 
- 📱 **Responsive Design** – Adapts to different screen sizes and orientations  
- 🎯 **Element Selection** – Visual feedback with dashed borders for selected elements  
- 🗑️ **Delete Elements** – Easy element removal with delete button  
- 🎨 **Random Colors** – Shapes get random colors for visual variety  

## 🚀 How to Run the Project

### Prerequisites
- Node.js (v16 or higher)  
- npm or yarn  
- Expo CLI  
- Android device or emulator  
- Expo Go app (for testing)  

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/farhan-sadik247/dragNdrop_editorApp.git
   cd dragNdrop_editorApp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install required libraries**
   ```bash
   npm install @shopify/react-native-skia
   npm install react-native-gesture-handler
   npm install react-native-reanimated
   npm install expo-image-picker
   npm install react-native-view-shot
   npm install expo-media-library
   npm install react-native-svg
   npm install react-native-safe-area-context
   ```

4. **Start the development server**
   ```bash
   npx expo start
   ```

5. **Run on device**
   - Scan the QR code with Expo Go app on your Android device  
   - Or press `a` to run on Android emulator  

### Permissions Required
The app will automatically request these permissions:
- **Camera Roll Access** – For image picker functionality  
- **Media Library Access** – For saving exported designs  

## 🎁 Bonus Features Added

### 1. **Advanced Shape Library** 🔷
- Circle, Triangle, Rectangle (basic shapes)  
- Star and Hexagon (complex shapes)  
- Random color assignment for visual variety  
- Smooth SVG rendering with proper scaling  

### 2. **Use TypeScript**  
- Strongly typed components and safer development experience  

---

## 📦 Download the App  
➡️ [Click here to download the Mini Design Editor App](https://tinyurl.com/DragNDrop2)

---

**Built with ❤️ using React Native & Expo**
