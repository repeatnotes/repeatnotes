import React, {useContext} from 'react';
import * as API from 'src/libs/api';
import logger from 'src/libs/logger';

export const CardContext = React.createContext<{
  loading: boolean;
  sm2: any;
  error: any;
  loadSm2: () => void;
}>({
  loading: false,
  sm2: null,
  error: null,
  loadSm2: () => Promise.resolve(),
});

export const useCard = () => useContext(CardContext);

type Props = React.PropsWithChildren<{}>;
type State = {
  loading: boolean;
  error: any;
  sm2: any;
};

export class CardProvider extends React.Component<Props, State> {
  state: State = {
    loading: true,
    sm2: null,
    error: null,
  };

  loadSm2 = async () => {
    this.setState({loading: true});

    try {
      if (!this.state.sm2) {
        const config = await API.fetchSrsConfig();
        const wasm = await import('@repeatnotes/sm2');
        const sm2 = new wasm.Sm2(config);
        this.setState({loading: false, sm2});
      }
    } catch (error) {
      logger.error(error);
      this.setState({loading: false, error});
    }
  };

  render() {
    const {sm2, loading, error} = this.state;

    return (
      <CardContext.Provider
        value={{
          loading,
          error,
          sm2,

          loadSm2: this.loadSm2,
        }}
      >
        {this.props.children}
      </CardContext.Provider>
    );
  }
}
