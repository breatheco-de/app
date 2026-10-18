import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import OnlyFor from './OnlyFor';

// Mock the dependencies
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/lesson/test-lesson',
  }),
}));

jest.mock('next-translate/useTranslation', () => ({
  __esModule: true,
  default: () => ({
    t: (key) => key,
  }),
}));

jest.mock('../hooks/useStyle', () => ({
  __esModule: true,
  default: () => ({
    featuredColor: '#0097CD',
    backgroundColor: '#FFFFFF',
  }),
}));

jest.mock('../hooks/useCohortHandler', () => ({
  __esModule: true,
  default: () => ({
    state: {
      userCapabilities: [],
      cohortSession: null,
    },
  }),
}));

jest.mock('./Icon', () => {
  return function MockIcon({ icon, width, height }) {
    return <div data-testid={`icon-${icon}`} style={{ width, height }} />;
  };
});

// Mock useAuth hook for different scenarios
const mockUseAuth = jest.fn();
jest.mock('../hooks/useAuth', () => ({
  __esModule: true,
  default: () => mockUseAuth(),
}));

const TestWrapper = ({ children }) => (
  <ChakraProvider>
    {children}
  </ChakraProvider>
);

describe('OnlyFor Component with onlyAnonymous', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('When onlyAnonymous is true', () => {
    it('should show content for anonymous users', () => {
      // Mock anonymous user (not authenticated)
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        hasNonSaasCohort: false,
      });

      render(
        <TestWrapper>
          <OnlyFor onlyAnonymous={true}>
            <div data-testid="anonymous-content">
              Sign up now to get started!
            </div>
          </OnlyFor>
        </TestWrapper>
      );

      expect(screen.getByTestId('anonymous-content')).toBeInTheDocument();
      expect(screen.getByText('Sign up now to get started!')).toBeInTheDocument();
    });

    it('should hide content for authenticated users', () => {
      // Mock authenticated user
      mockUseAuth.mockReturnValue({
        user: { 
          id: 1, 
          email: 'test@example.com',
          permissions: [],
          roles: []
        },
        isAuthenticated: true,
        hasNonSaasCohort: false,
      });

      render(
        <TestWrapper>
          <OnlyFor onlyAnonymous={true}>
            <div data-testid="anonymous-content">
              Sign up now to get started!
            </div>
          </OnlyFor>
        </TestWrapper>
      );

      expect(screen.queryByTestId('anonymous-content')).not.toBeInTheDocument();
      expect(screen.queryByText('Sign up now to get started!')).not.toBeInTheDocument();
    });

    it('should show banner for authenticated users when withBanner is true', () => {
      // Mock authenticated user
      mockUseAuth.mockReturnValue({
        user: { 
          id: 1, 
          email: 'test@example.com',
          permissions: [],
          roles: []
        },
        isAuthenticated: true,
        hasNonSaasCohort: false,
      });

      render(
        <TestWrapper>
          <OnlyFor onlyAnonymous={true} withBanner={true}>
            <div data-testid="anonymous-content">
              Sign up now to get started!
            </div>
          </OnlyFor>
        </TestWrapper>
      );

      // Content should be hidden
      expect(screen.queryByTestId('anonymous-content')).not.toBeInTheDocument();
      
      // Banner should be visible
      expect(screen.getByTestId('icon-padlock')).toBeInTheDocument();
    });
  });

  describe('When onlyAnonymous is false', () => {
    it('should use existing logic for authenticated users with capabilities', () => {
      // Mock authenticated user with capabilities
      mockUseAuth.mockReturnValue({
        user: { 
          id: 1, 
          email: 'test@example.com',
          permissions: [{ codename: 'read_lesson' }],
          roles: [{ role: 'STUDENT' }]
        },
        isAuthenticated: true,
        hasNonSaasCohort: false,
      });

      render(
        <TestWrapper>
          <OnlyFor onlyAnonymous={false} capabilities={['read_lesson']}>
            <div data-testid="member-content">
              Welcome back, student!
            </div>
          </OnlyFor>
        </TestWrapper>
      );

      expect(screen.getByTestId('member-content')).toBeInTheDocument();
      expect(screen.getByText('Welcome back, student!')).toBeInTheDocument();
    });

    it('should hide content for anonymous users when capabilities are required', () => {
      // Mock anonymous user
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        hasNonSaasCohort: false,
      });

      render(
        <TestWrapper>
          <OnlyFor onlyAnonymous={false} capabilities={['read_lesson']}>
            <div data-testid="member-content">
              Welcome back, student!
            </div>
          </OnlyFor>
        </TestWrapper>
      );

      expect(screen.queryByTestId('member-content')).not.toBeInTheDocument();
    });
  });

  describe('Practical usage scenarios', () => {
    it('should work in lesson pages for anonymous marketing content', () => {
      // Anonymous user visiting a lesson
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        hasNonSaasCohort: false,
      });

      render(
        <TestWrapper>
          <div>
            {/* Main lesson content - always visible */}
            <div data-testid="lesson-content">
              Learn JavaScript fundamentals...
            </div>
            
            {/* Anonymous-only promotional content */}
            <OnlyFor onlyAnonymous={true}>
              <div data-testid="signup-cta">
                <h3>Want to continue learning?</h3>
                <p>Sign up for free to access more lessons!</p>
              </div>
            </OnlyFor>
            
            {/* Member-only content */}
            <OnlyFor onlyMember={true}>
              <div data-testid="progress-section">
                Your progress: 75%
              </div>
            </OnlyFor>
          </div>
        </TestWrapper>
      );

      // Lesson content should be visible
      expect(screen.getByTestId('lesson-content')).toBeInTheDocument();
      
      // Anonymous CTA should be visible
      expect(screen.getByTestId('signup-cta')).toBeInTheDocument();
      expect(screen.getByText('Want to continue learning?')).toBeInTheDocument();
      
      // Progress section should not be visible
      expect(screen.queryByTestId('progress-section')).not.toBeInTheDocument();
    });

    it('should work in lesson pages for authenticated member content', () => {
      // Authenticated user visiting a lesson
      mockUseAuth.mockReturnValue({
        user: { 
          id: 1, 
          email: 'test@example.com',
          permissions: [],
          roles: [{ role: 'STUDENT' }]
        },
        isAuthenticated: true,
        hasNonSaasCohort: false,
      });

      render(
        <TestWrapper>
          <div>
            {/* Main lesson content - always visible */}
            <div data-testid="lesson-content">
              Learn JavaScript fundamentals...
            </div>
            
            {/* Anonymous-only promotional content */}
            <OnlyFor onlyAnonymous={true}>
              <div data-testid="signup-cta">
                <h3>Want to continue learning?</h3>
                <p>Sign up for free to access more lessons!</p>
              </div>
            </OnlyFor>
            
            {/* Member-only content */}
            <OnlyFor onlyMember={true}>
              <div data-testid="progress-section">
                Your progress: 75%
              </div>
            </OnlyFor>
          </div>
        </TestWrapper>
      );

      // Lesson content should be visible
      expect(screen.getByTestId('lesson-content')).toBeInTheDocument();
      
      // Anonymous CTA should NOT be visible
      expect(screen.queryByTestId('signup-cta')).not.toBeInTheDocument();
      
      // Progress section should be visible
      expect(screen.getByTestId('progress-section')).toBeInTheDocument();
    });
  });
});