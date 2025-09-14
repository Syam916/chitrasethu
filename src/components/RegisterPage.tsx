import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Camera, Eye, EyeOff, Mail, Lock, User, Phone, UserCheck, Users, Star, Award, CheckCircle2 } from 'lucide-react';
import registerImage from '@/assets/register-photography.jpg';

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState('user');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate registration process
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <div className="min-h-screen flex">
      {/* Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Animated Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center animate-subtleZoom"
          style={{ backgroundImage: `url(${registerImage})` }}
        />
        {/* Animated Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-background/90 to-background/40 animate-gradientShift" style={{
          background: 'linear-gradient(-45deg, hsl(220 13% 9% / 0.9), hsl(220 13% 15% / 0.6), hsl(220 13% 11% / 0.8))',
          backgroundSize: '400% 400%'
        }} />
        
        {/* Floating Camera Icons */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <Camera className="absolute top-1/4 left-1/6 w-4 h-4 text-primary/20 animate-floatingParticles" style={{ animationDelay: '0s' }} />
          <Camera className="absolute top-1/2 right-1/4 w-3 h-3 text-primary/30 animate-floatingParticles" style={{ animationDelay: '3s' }} />
          <Camera className="absolute bottom-1/3 left-1/3 w-5 h-5 text-primary/15 animate-floatingParticles" style={{ animationDelay: '6s' }} />
          <Star className="absolute top-1/3 right-1/3 w-2 h-2 text-primary/25 animate-floatingParticles" style={{ animationDelay: '2s' }} />
          <Star className="absolute bottom-1/4 right-1/6 w-3 h-3 text-primary/20 animate-floatingParticles" style={{ animationDelay: '8s' }} />
          <Award className="absolute top-2/3 left-1/4 w-4 h-4 text-primary/25 animate-floatingParticles" style={{ animationDelay: '5s' }} />
        </div>
        
        {/* Floating Content */}
        <div className="relative z-10 flex flex-col justify-center items-start p-12 text-foreground animate-parallaxFloat">
          <div className="animate-fadeInUp">
            <div className="inline-flex items-center mb-6">
              <Camera className="w-8 h-8 text-primary mr-3 animate-float" />
              <span className="text-3xl font-playfair font-bold gradient-text">PhotoStudio Pro</span>
            </div>
            
            <h1 className="text-5xl font-playfair font-bold mb-6 leading-tight">
              Join Our Creative
              <span className="block gradient-text">Community</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-md">
              Whether you're a professional photographer or looking to book one, start your journey with us today.
            </p>
            
            {/* Benefits */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center animate-slideInRight" style={{ animationDelay: '0.2s' }}>
                <CheckCircle2 className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
                <span className="text-foreground">Connect with verified photographers</span>
              </div>
              <div className="flex items-center animate-slideInRight" style={{ animationDelay: '0.4s' }}>
                <CheckCircle2 className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
                <span className="text-foreground">Secure booking and payment system</span>
              </div>
              <div className="flex items-center animate-slideInRight" style={{ animationDelay: '0.6s' }}>
                <CheckCircle2 className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
                <span className="text-foreground">Portfolio showcase and reviews</span>
              </div>
              <div className="flex items-center animate-slideInRight" style={{ animationDelay: '0.8s' }}>
                <CheckCircle2 className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
                <span className="text-foreground">24/7 customer support</span>
              </div>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center animate-slideInRight" style={{ animationDelay: '1s' }}>
                <div className="flex items-center justify-center mb-2">
                  <Users className="w-5 h-5 text-primary mr-2" />
                  <span className="text-2xl font-bold">500+</span>
                </div>
                <p className="text-sm text-muted-foreground">Photographers</p>
              </div>
              <div className="text-center animate-slideInRight" style={{ animationDelay: '1.2s' }}>
                <div className="flex items-center justify-center mb-2">
                  <Star className="w-5 h-5 text-primary mr-2" />
                  <span className="text-2xl font-bold">4.9</span>
                </div>
                <p className="text-sm text-muted-foreground">Rating</p>
              </div>
              <div className="text-center animate-slideInRight" style={{ animationDelay: '1.4s' }}>
                <div className="flex items-center justify-center mb-2">
                  <Award className="w-5 h-5 text-primary mr-2" />
                  <span className="text-2xl font-bold">Award</span>
                </div>
                <p className="text-sm text-muted-foreground">Winning</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Registration Form Section */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-lg">
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center mb-4">
              <Camera className="w-8 h-8 text-primary mr-3" />
              <span className="text-2xl font-playfair font-bold gradient-text">PhotoStudio Pro</span>
            </div>
          </div>

          <Card className="glass-effect shadow-elegant animate-fadeInUp">
            <CardHeader className="text-center space-y-2">
              <CardTitle className="text-2xl font-playfair">Create Account</CardTitle>
              <p className="text-muted-foreground">Join our creative community today</p>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* User Type Selection */}
                <div className="space-y-4">
                  <Label className="text-sm font-medium">I am a:</Label>
                  <RadioGroup value={userType} onValueChange={setUserType} className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="user" id="user" className="border-primary text-primary" />
                      <Label htmlFor="user" className="flex items-center cursor-pointer">
                        <User className="w-4 h-4 mr-2 text-primary" />
                        Client
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="photographer" id="photographer" className="border-primary text-primary" />
                      <Label htmlFor="photographer" className="flex items-center cursor-pointer">
                        <Camera className="w-4 h-4 mr-2 text-primary" />
                        Photographer
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Name Field */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      className="pl-10 glass-effect border-primary/20 focus:border-primary transition-smooth"
                      required
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      className="pl-10 glass-effect border-primary/20 focus:border-primary transition-smooth"
                      required
                    />
                  </div>
                </div>

                {/* Mobile Number Field */}
                <div className="space-y-2">
                  <Label htmlFor="mobile" className="text-sm font-medium">Mobile Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="mobile"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      className="pl-10 glass-effect border-primary/20 focus:border-primary transition-smooth"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      className="pl-10 pr-10 glass-effect border-primary/20 focus:border-primary transition-smooth"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-smooth"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      className="pl-10 pr-10 glass-effect border-primary/20 focus:border-primary transition-smooth"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-smooth"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="flex items-start space-x-2">
                  <input 
                    type="checkbox" 
                    id="terms" 
                    className="mt-1 rounded border-primary/20" 
                    required 
                  />
                  <Label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer">
                    I agree to the{' '}
                    <a href="#" className="text-primary hover:text-primary/80 transition-smooth">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="#" className="text-primary hover:text-primary/80 transition-smooth">
                      Privacy Policy
                    </a>
                  </Label>
                </div>

                <Button 
                  type="submit" 
                  variant="hero" 
                  size="lg" 
                  className="w-full transition-bounce"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Button variant="glass" className="transition-bounce">
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Google
                  </Button>
                  <Button variant="glass" className="transition-bounce">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Facebook
                  </Button>
                </div>

                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <a href="/login" className="text-primary hover:text-primary/80 transition-smooth font-medium">
                    Sign in here
                  </a>
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;