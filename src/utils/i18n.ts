import { Language } from '../types';

export const translations = {
  en: {
    // Auth Screen
    welcome: 'Welcome to Orniva',
    signIn: 'Sign In',
    signUp: 'Sign Up',
    email: 'Email',
    password: 'Password',
    username: 'Username (Optional)',
    noAccount: "Don't have an account?",
    haveAccount: 'Already have an account?',
    
    // Home Screen
    credits: 'Credits',
    uploadPhoto: 'Upload Bird Photo',
    takePhoto: 'Take Photo',
    chooseFromGallery: 'Choose from Gallery',
    inspirationalQuote: 'Discover the beauty of birds around you',
    
    // Analysis Screen
    analyzing: 'Analyzing bird...',
    pleaseWait: 'Please wait while we identify your bird',
    
    // Results Screen
    birdSpecies: 'Bird Species',
    confidence: 'Confidence',
    description: 'Description',
    analyzeAnother: 'Analyze Another Bird',
    remaining: 'Remaining',
    
    // Settings Screen
    settings: 'Settings',
    profile: 'Profile',
    language: 'Language',
    darkMode: 'Dark Mode',
    logout: 'Logout',
    helpFAQ: 'Help & FAQ',
    
    // Errors
    error: 'Error',
    insufficientCredits: 'Insufficient credits. Please purchase more credits to continue.',
    networkError: 'Network error. Please check your connection.',
    invalidCredentials: 'Invalid email or password.',
    emailInUse: 'This email is already in use.',
    genericError: 'Something went wrong. Please try again.',
    noImageSelected: 'No image selected.',
    geminiNotConfigured: 'Gemini API is not configured. Please add your API key.',
    
    // Success
    success: 'Success',
    signInSuccess: 'Signed in successfully!',
    signUpSuccess: 'Account created successfully!',
    signOutSuccess: 'Signed out successfully!',
    profileUpdated: 'Profile updated successfully!',
  },
  tr: {
    // Auth Screen
    welcome: 'Orniva\'ya Hoş Geldiniz',
    signIn: 'Giriş Yap',
    signUp: 'Kayıt Ol',
    email: 'E-posta',
    password: 'Şifre',
    username: 'Kullanıcı Adı (İsteğe Bağlı)',
    noAccount: 'Hesabınız yok mu?',
    haveAccount: 'Zaten hesabınız var mı?',
    
    // Home Screen
    credits: 'Kredi',
    uploadPhoto: 'Kuş Fotoğrafı Yükle',
    takePhoto: 'Fotoğraf Çek',
    chooseFromGallery: 'Galeriden Seç',
    inspirationalQuote: 'Etrafınızdaki kuşların güzelliğini keşfedin',
    
    // Analysis Screen
    analyzing: 'Kuş analiz ediliyor...',
    pleaseWait: 'Lütfen kuşunuz tanımlanırken bekleyin',
    
    // Results Screen
    birdSpecies: 'Kuş Türü',
    confidence: 'Güvenilirlik',
    description: 'Açıklama',
    analyzeAnother: 'Başka Bir Kuş Analiz Et',
    remaining: 'Kalan',
    
    // Settings Screen
    settings: 'Ayarlar',
    profile: 'Profil',
    language: 'Dil',
    darkMode: 'Karanlık Mod',
    logout: 'Çıkış Yap',
    helpFAQ: 'Yardım ve SSS',
    
    // Errors
    error: 'Hata',
    insufficientCredits: 'Yetersiz kredi. Devam etmek için lütfen daha fazla kredi satın alın.',
    networkError: 'Ağ hatası. Lütfen bağlantınızı kontrol edin.',
    invalidCredentials: 'Geçersiz e-posta veya şifre.',
    emailInUse: 'Bu e-posta zaten kullanımda.',
    genericError: 'Bir şeyler ters gitti. Lütfen tekrar deneyin.',
    noImageSelected: 'Resim seçilmedi.',
    geminiNotConfigured: 'Gemini API yapılandırılmamış. Lütfen API anahtarınızı ekleyin.',
    
    // Success
    success: 'Başarılı',
    signInSuccess: 'Başarıyla giriş yapıldı!',
    signUpSuccess: 'Hesap başarıyla oluşturuldu!',
    signOutSuccess: 'Başarıyla çıkış yapıldı!',
    profileUpdated: 'Profil başarıyla güncellendi!',
  },
};

export const t = (key: keyof typeof translations.en, language: Language = 'en'): string => {
  return translations[language][key] || translations.en[key] || key;
};