import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Loader2, Server, Database, User } from 'lucide-react';
import { API_BASE_URL } from '@/config/api';
import authService from '@/services/auth.service';
import photographerService from '@/services/photographer.service';
import postService from '@/services/post.service';

const TestConnection = () => {
  const [tests, setTests] = useState({
    backend: { status: 'pending', message: '' },
    database: { status: 'pending', message: '' },
    auth: { status: 'pending', message: '' },
    photographers: { status: 'pending', message: '' },
    posts: { status: 'pending', message: '' },
  });

  const runTests = async () => {
    // Test 1: Backend Health
    try {
      const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
      const data = await response.json();
      setTests(prev => ({
        ...prev,
        backend: { status: 'success', message: `Backend is running: ${data.message}` }
      }));
    } catch (error) {
      setTests(prev => ({
        ...prev,
        backend: { status: 'error', message: 'Backend is not reachable' }
      }));
    }

    // Test 2: Database Connection (via API)
    try {
      const response = await fetch(`${API_BASE_URL}/photographers`);
      if (response.ok) {
        setTests(prev => ({
          ...prev,
          database: { status: 'success', message: 'Database connection successful' }
        }));
      } else {
        setTests(prev => ({
          ...prev,
          database: { status: 'error', message: 'Database connection failed' }
        }));
      }
    } catch (error) {
      setTests(prev => ({
        ...prev,
        database: { status: 'error', message: 'Cannot connect to database' }
      }));
    }

    // Test 3: Authentication
    const isAuth = authService.isAuthenticated();
    const user = authService.getStoredUser();
    setTests(prev => ({
      ...prev,
      auth: {
        status: isAuth ? 'success' : 'warning',
        message: isAuth ? `Logged in as: ${user?.fullName}` : 'Not logged in'
      }
    }));

    // Test 4: Photographers API
    try {
      const photographers = await photographerService.getAll();
      setTests(prev => ({
        ...prev,
        photographers: {
          status: 'success',
          message: `Found ${photographers.length} photographers`
        }
      }));
    } catch (error: any) {
      setTests(prev => ({
        ...prev,
        photographers: { status: 'error', message: error.message }
      }));
    }

    // Test 5: Posts API
    try {
      const posts = await postService.getAll();
      setTests(prev => ({
        ...prev,
        posts: {
          status: 'success',
          message: `Found ${posts.length} posts`
        }
      }));
    } catch (error: any) {
      setTests(prev => ({
        ...prev,
        posts: { status: 'error', message: error.message }
      }));
    }
  };

  useEffect(() => {
    runTests();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <XCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Connection Test</h1>
          <p className="text-muted-foreground">Testing frontend-backend integration</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>System Status</span>
              <Button onClick={runTests} variant="outline" size="sm">
                Retest
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Backend Test */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Server className="w-6 h-6 text-primary" />
                <div>
                  <div className="font-semibold">Backend Server</div>
                  <div className="text-sm text-muted-foreground">{tests.backend.message}</div>
                </div>
              </div>
              {getStatusIcon(tests.backend.status)}
            </div>

            {/* Database Test */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Database className="w-6 h-6 text-primary" />
                <div>
                  <div className="font-semibold">Database Connection</div>
                  <div className="text-sm text-muted-foreground">{tests.database.message}</div>
                </div>
              </div>
              {getStatusIcon(tests.database.status)}
            </div>

            {/* Auth Test */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <User className="w-6 h-6 text-primary" />
                <div>
                  <div className="font-semibold">Authentication</div>
                  <div className="text-sm text-muted-foreground">{tests.auth.message}</div>
                </div>
              </div>
              {getStatusIcon(tests.auth.status)}
            </div>

            {/* Photographers API Test */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Server className="w-6 h-6 text-primary" />
                <div>
                  <div className="font-semibold">Photographers API</div>
                  <div className="text-sm text-muted-foreground">{tests.photographers.message}</div>
                </div>
              </div>
              {getStatusIcon(tests.photographers.status)}
            </div>

            {/* Posts API Test */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Server className="w-6 h-6 text-primary" />
                <div>
                  <div className="font-semibold">Posts API</div>
                  <div className="text-sm text-muted-foreground">{tests.posts.message}</div>
                </div>
              </div>
              {getStatusIcon(tests.posts.status)}
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center space-y-4">
          <div className="flex justify-center space-x-4">
            <Button onClick={() => window.location.href = '/login'}>
              Go to Login
            </Button>
            <Button onClick={() => window.location.href = '/register'} variant="outline">
              Go to Register
            </Button>
            <Button onClick={() => window.location.href = '/home'} variant="outline">
              Go to Home
            </Button>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p>API Base URL: {API_BASE_URL}</p>
            <p>Backend URL: {API_BASE_URL.replace('/api', '')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestConnection;

