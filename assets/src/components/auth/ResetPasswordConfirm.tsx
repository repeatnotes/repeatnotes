import React, {useState} from 'react';
import Logo from '../../img/logo.svg';
import * as API from '../../libs/api';

import {
  LockClosedOutline,
  EyeOutline,
  EyeOffOutline,
  ExclamationCircleOutline,
} from '@graywolfai/react-heroicons';

import {
  RouteComponentProps,
  Link,
  withRouter,
  useHistory,
} from 'react-router-dom';

import logger from 'src/libs/logger';
import {parseResponseErrors} from 'src/libs/utils/error';

type ConfirmProps = {
  onSubmit: (email: string) => Promise<void>;
  submitting: boolean;
  error: string;
};

function Confirm(props: ConfirmProps) {
  const {submitting, error} = props;
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    props.onSubmit(password);
  };

  return (
    <main className="flex items-center justify-center min-h-screen">
      <section className="flex flex-col items-center justify-center w-full max-w-sm p-4 mt-8 text-center">
        <Link to="/" className="mb-8">
          <img className="w-24" src={Logo} alt="logo" />
        </Link>
        <h1 className="mb-8 text-xl font-bold">Choose a new password</h1>
        <div className="flex-auto w-full">
          <form onSubmit={handleSubmit}>
            <div className="relative flex flex-row items-stretch content-center justify-center w-full mb-4">
              <div className="flex-none px-3 py-2 text-gray-700 bg-gray-100 border-t border-b border-l border-gray-200 rounded-l-sm">
                <LockClosedOutline className="w-5" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                className="flex-1 w-full py-2 pl-3 pr-10 text-gray-700 placeholder-gray-700 bg-white border border-gray-200 rounded-l-none rounded-r-sm outline-none appearance-none focus:border-indigo-500"
                placeholder="New password"
                value={password}
                onChange={(e) => {
                  const val = e.target.value;
                  setPassword(val);
                }}
                required
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
                <ExclamationCircleOutline className="w-5" />
                <span className="ml-1">{error}</span>
              </div>
            )}

            <div className="text-center">
              <button
                className="w-full px-6 py-2 btn-primary"
                type="submit"
                disabled={submitting}
              >
                Reset password
              </button>
            </div>
          </form>
        </div>
        <p className="mt-8">
          {'Already have an account?'}
          <Link
            to="/login"
            className="ml-1 font-bold text-indigo-500 hover:text-indigo-600"
          >
            Log In
          </Link>
        </p>
        <div className="h-48" />
      </section>
    </main>
  );
}

interface Props extends RouteComponentProps<{token: string}> {}

const ConfirmPage: React.FunctionComponent<Props> = ({match}) => {
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const {token} = match.params;
  const history = useHistory();

  const onSubmit = async (password: string) => {
    setSubmitting(true);
    setError('');

    try {
      await API.attemptPasswordReset(token, {
        password,
        passwordConfirmation: password,
      });
      history.push('/login');
    } catch (err) {
      logger.error('Error!', err);
      const [error] = parseResponseErrors(err);
      setError(error);
    } finally {
      setSubmitting(false);
    }
  };
  return <Confirm error={error} submitting={submitting} onSubmit={onSubmit} />;
};

export default withRouter(ConfirmPage);
