import React, {useState} from 'react';
import Logo from 'src/img/logo.svg';

import qs from 'query-string';
import {
  MailOutline,
  LockClosedOutline,
  EyeOutline,
  EyeOffOutline,
  ExclamationCircleOutline,
} from '@graywolfai/react-heroicons';
import {Link, useLocation, useHistory} from 'react-router-dom';
import logger from 'src/libs/logger';
import {parseResponseErrors} from 'src/libs/utils/error';

import {useAuth} from './AuthProvider';

type Props = {
  onSubmit: (email: string, password: string) => Promise<void>;
  submitting: boolean;
  error: string;
  redirect: string;
  setError: (e: string) => void;
};

function SignUp(props: Props) {
  const {onSubmit, submitting, error, setError, redirect} = props;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const getValidationError = () => {
    if (!email) {
      return 'Email is required';
    } else if (!password) {
      return 'Password is required';
    } else if (password.length < 8) {
      return 'Password must be at least 8 characters';
    } else {
      return '';
    }
  };

  const handleInputBlur = () => {
    if (!submitted) {
      return;
    }

    setError(getValidationError());
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const error = getValidationError();
    if (error) {
      setError(error);
      setSubmitted(true);
      return;
    }

    await onSubmit(email, password);
  };

  return (
    <main className="flex items-center justify-center min-h-screen">
      <section className="flex flex-col items-center justify-center w-full max-w-sm p-4 mt-8 text-center">
        <Link to="/" className="mb-8">
          <img className="w-24" src={Logo} alt="logo" />
        </Link>
        <h1 className="pb-2 text-2xl font-bold">Create your account</h1>
        <p>{'RepeatNotes is an open source project.'}</p>
        <div className="flex-auto w-full py-10">
          <form onSubmit={handleSubmit}>
            <div className="relative flex flex-row items-stretch content-center justify-center w-full mb-4">
              <div className="flex-none px-3 py-2 text-gray-700 bg-gray-100 border-t border-b border-l border-gray-200 rounded-l-sm">
                <MailOutline className="w-5" />
              </div>
              <input
                type="email"
                className="flex-1 w-full px-3 py-2 text-gray-700 placeholder-gray-700 bg-white border border-gray-200 rounded-l-none rounded-r-sm appearance-none focus:outline-none focus:border-indigo-500"
                placeholder="Email"
                value={email}
                onChange={(e) => {
                  const val = e.target.value;
                  setEmail(val);
                }}
                onBlur={handleInputBlur}
              />
            </div>

            <div className="relative flex flex-row items-stretch content-center justify-center w-full mb-4">
              <div className="flex-none px-3 py-2 text-gray-700 bg-gray-100 border-t border-b border-l border-gray-200 rounded-l-sm">
                <LockClosedOutline className="w-5" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                className="flex-1 w-full py-2 pl-3 pr-10 text-gray-700 placeholder-gray-700 bg-white border border-gray-200 rounded-l-none rounded-r-sm appearance-none focus:outline-none focus:border-indigo-500"
                placeholder="Password"
                value={password}
                onChange={(e) => {
                  const val = e.target.value;
                  setPassword(val);
                }}
                onBlur={handleInputBlur}
              />
              <div
                className="absolute inset-y-0 right-0 flex items-center pr-3"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOffOutline className="w-5" />
                ) : (
                  <EyeOutline className="w-5" />
                )}
              </div>
            </div>

            {error && (
              <div className="flex items-center mb-4 text-sm text-red-500">
                <ExclamationCircleOutline className="w-5 h-5" />
                <span className="ml-1">{error}</span>
              </div>
            )}

            <div className="mb-1 mr-1 text-center">
              <button
                className="w-full px-4 py-2 font-bold btn-primary"
                type="submit"
                disabled={submitting}
              >
                Sign Up
              </button>
            </div>
          </form>
        </div>
        <p>
          {'Already have an account?'}
          <Link
            to={{pathname: '/login', search: `redirect=${redirect}`}}
            className="ml-1 font-bold text-indigo-500 hover:text-indigo-600"
          >
            Log In.
          </Link>
        </p>
        <div className="h-48" />
      </section>
    </main>
  );
}

export default function SignUpPage() {
  const auth = useAuth();
  const history = useHistory();
  const location = useLocation();

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const {redirect = '/'} = qs.parse(location.search);

  const onSubmit = async (email: string, password: string) => {
    setSubmitting(true);
    setError('');

    try {
      await auth.register({email, password});
      history.push(String(redirect));
    } catch (err) {
      logger.error('Error!', err);
      const [error] = parseResponseErrors(err);
      setError(error);
      setSubmitting(false);
    }
  };

  return (
    <SignUp
      onSubmit={onSubmit}
      submitting={submitting}
      error={error}
      setError={setError}
      redirect={String(redirect)}
    />
  );
}
