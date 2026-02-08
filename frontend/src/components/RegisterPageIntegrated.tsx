import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Camera, Eye, EyeOff, Mail, Lock, User, Phone, UserCheck, Users, Star, Award, CheckCircle2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import registerImage from '@/assets/register-photography.jpg';
import authService from '@/services/auth.service';

const RegisterPageIntegrated = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    userType: 'customer'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleUserTypeChange = (value: string) => {
    setFormData({
      ...formData,
      userType: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.register({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        userType: formData.userType as 'customer' | 'photographer',
        phone: formData.phone
      });

      console.log('Registration successful:', response);
      
      // Redirect based on user type
      const userType = response?.data?.user?.userType || formData.userType;
      const normalizedType = typeof userType === 'string' ? userType.toLowerCase() : '';
      
      if (normalizedType === 'photographer') {
        navigate('/photographer/home');
      } else {
        navigate('/home');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center animate-subtleZoom"
          style={{ backgroundImage: `url(${registerImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-background/90 to-background/40 animate-gradientShift" style={{
          background: 'linear-gradient(-45deg, hsl(220 13% 9% / 0.9), hsl(220 13% 15% / 0.6), hsl(220 13% 11% / 0.8))',
          backgroundSize: '400% 400%'
        }} />
        
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <Camera className="absolute top-1/4 left-1/6 w-4 h-4 text-primary/20 animate-floatingParticles" style={{ animationDelay: '0s' }} />
          <Camera className="absolute top-1/2 right-1/4 w-3 h-3 text-primary/30 animate-floatingParticles" style={{ animationDelay: '3s' }} />
          <Star className="absolute top-1/3 right-1/3 w-2 h-2 text-primary/25 animate-floatingParticles" style={{ animationDelay: '2s' }} />
        </div>
        
        <div className="relative z-10 flex flex-col justify-center items-start p-12 text-foreground">
          <div>
            <div className="inline-flex items-center mb-6">
              <img 
                src="/chitrasethu_logo.png" 
                alt="Chitrasethu Logo" 
                className="w-8 h-8 mr-3 object-contain"
              />
              <span className="text-3xl font-playfair font-bold gradient-text">Chitrasethu</span>
            </div>
            
            <h1 className="text-5xl font-playfair font-bold mb-6 leading-tight">
              Join Our Creative
              <span className="block gradient-text">Community</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-md">
              Whether you're a professional photographer or looking to book one, start your journey with us today.
            </p>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center">
                <CheckCircle2 className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
                <span className="text-foreground">Connect with verified photographers</span>
              </div>
              <div className="flex items-center">
                <CheckCircle2 className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
                <span className="text-foreground">Secure booking and payment system</span>
              </div>
              <div className="flex items-center">
                <CheckCircle2 className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
                <span className="text-foreground">Portfolio showcase and reviews</span>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Users className="w-5 h-5 text-primary mr-2" />
                  <span className="text-2xl font-bold">500+</span>
                </div>
                <p className="text-sm text-muted-foreground">Photographers</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Star className="w-5 h-5 text-primary mr-2" />
                  <span className="text-2xl font-bold">4.9</span>
                </div>
                <p className="text-sm text-muted-foreground">Rating</p>
              </div>
              <div className="text-center">
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

      {/* Register Form Section */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center mb-4">
              <Camera className="w-8 h-8 text-primary mr-3" />
              <span className="text-2xl font-playfair font-bold gradient-text">Chitrasethu</span>
            </div>
          </div>

          <Card className="border-border/50 shadow-2xl backdrop-blur-sm bg-card/95">
            <CardHeader className="space-y-1">
              <CardTitle className="text-3xl font-playfair font-bold text-center gradient-text">
                Create Account
              </CardTitle>
              <p className="text-center text-muted-foreground">
                Join thousands of happy users
              </p>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-medium">
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="fullName"
                      name="fullName"
                      type="text"
                      placeholder="John Doe"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="pl-10 h-11 bg-background/50 border-border/50 focus:border-primary"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="pl-10 h-11 bg-background/50 border-border/50 focus:border-primary"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">
                    Phone Number (Optional)
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={handleChange}
                      className="pl-10 h-11 bg-background/50 border-border/50 focus:border-primary"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">I am a</Label>
                  <RadioGroup value={formData.userType} onValueChange={handleUserTypeChange} disabled={isLoading}>
                    <div className="flex items-center space-x-2 p-3 rounded-lg border border-border/50 hover:border-primary/50 transition-colors">
                      <RadioGroupItem value="customer" id="customer" />
                      <Label htmlFor="customer" className="flex items-center cursor-pointer flex-1">
                        <UserCheck className="w-4 h-4 mr-2 text-primary" />
                        <div>
                          <div className="font-medium">Customer</div>
                          <div className="text-xs text-muted-foreground">Looking to book photographers</div>
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 rounded-lg border border-border/50 hover:border-primary/50 transition-colors">
                      <RadioGroupItem value="photographer" id="photographer" />
                      <Label htmlFor="photographer" className="flex items-center cursor-pointer flex-1">
                        <Camera className="w-4 h-4 mr-2 text-primary" />
                        <div>
                          <div className="font-medium">Photographer</div>
                          <div className="text-xs text-muted-foreground">Offering photography services</div>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      className="pl-10 pr-10 h-11 bg-background/50 border-border/50 focus:border-primary"
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="pl-10 pr-10 h-11 bg-background/50 border-border/50 focus:border-primary"
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 text-base font-semibold"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Creating account...</span>
                    </div>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <a href="/login" className="text-primary font-semibold hover:underline">
                    Sign in
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RegisterPageIntegrated;

