import React, { Component, Fragment } from 'react'
import { FormattedMessage } from 'react-intl'
import { inject, observer } from 'mobx-react'
import { compose } from 'recompose'
import { Grid, Row, Col, Button, Dropdown, MenuItem } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { GET_BALANCE_INTERVAL } from '../constants/Values'

class Wallet extends Component {
  constructor(props) {
    super(props)

    this.state = {
      balanceIntervalId: 0,
      tokens: []
    }
  }

  componentDidMount = async () => {
    const { accountStore } = this.props

    if (accountStore.isLogin) {
      this.getWalletBalace()
      const balanceIntervalId = setInterval(this.getWalletBalace, GET_BALANCE_INTERVAL)

      this.setState({
        balanceIntervalId: balanceIntervalId
      })
    }

    this.disposer = accountStore.subscribeLoginState(changed => {
      if (changed.oldValue !== changed.newValue) {
        if (changed.newValue) {
          this.getWalletBalace()
          const balanceIntervalId = setInterval(this.getWalletBalace, GET_BALANCE_INTERVAL)

          this.setState({
            balanceIntervalId: balanceIntervalId
          })
        } else {
          clearInterval(this.state.balanceIntervalId)
        }
      }
    })
  }

  componentWillUnmount = () => {
    if (this.state.balanceIntervalId > 0) {
      clearInterval(this.state.balanceIntervalId)
    }

    if (this.disposer) {
      this.disposer()
    }
  }

  getWalletBalace = async () => {
    const { accountStore, marketStore, eosioStore } = this.props

    const tokens = marketStore.tokens ? (marketStore.tokens.data ? marketStore.tokens.data.tokens : null) : null

    let tokenBalance = []

    const accountName = accountStore.loginAccountInfo ? accountStore.loginAccountInfo.account_name : null

    if (accountName && tokens) {
      for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i]
        const balance = await eosioStore.getCurrencyBalance({
          code: token.contract,
          account: accountStore.loginAccountInfo.account_name,
          symbol: token.symbol
        })

        tokenBalance.push({
          id: token.id,
          name: token.name,
          symbol: token.symbol,
          balance: balance.length > 0 ? balance[0].split(' ')[0] : 0.0
        })
      }
    }

    this.setState({
      tokens: tokenBalance
    })
  }

  handleTokenSymbolChange = async () => {}

  render() {
    const { accountStore } = this.props

    return (
      <Fragment>
        {accountStore.isLogin ? (
          <section>
            <div className="container-overlap bg-blue-500">
              <div className="media m0 pv">
                <div className="media-left" />
                <div className="media-body media-middle">
                  <h4 className="media-heading">{accountStore.loginAccountInfo.account_name}</h4>
                  <h4 className="media-heading">{`${accountStore.liquid} EOS`}</h4>
                </div>
              </div>
            </div>
            <Grid fluid>
              <Row>
                {/* Left column */}
                <Col md={7} lg={8}>
                  <form name="user.profileForm" className="card">
                    <h5 className="card-heading pb0">
                      <FormattedMessage id="Token Balance" />
                    </h5>
                    <div className="card-body">
                      <Row>
                        <Col xs={6}>
                          <input
                            type="text"
                            className="form-control form-control-lg"
                            placeholder="Enter Symbol"
                            onChange={s => this.handleTokenSymbolChange(s)}
                          />
                        </Col>
                        <Col xs={6} className="text-right">
                          <label class="checkbox checkbox-inline">
                            <input type="checkbox" value="" />
                            Hide no balance
                          </label>
                        </Col>
                      </Row>
                    </div>
                    <div className="card-divider" />
                    <div className="card-body">
                      <table className="table table-striped">
                        <thead>
                          <tr>
                            <th>
                              <FormattedMessage id="Token" />
                            </th>
                            <th>
                              <FormattedMessage id="Available" />
                            </th>
                            <th>
                              <FormattedMessage id="Frozen" />
                            </th>
                            <th>
                              <FormattedMessage id="EOS valuation" />
                            </th>
                            <th>
                              <FormattedMessage id="Exchange" />
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {accountStore.isLogin &&
                            this.state.tokens.map((token, idx) => {
                              return (
                                <tr key={idx}>
                                  <td style={{ textAlign: 'left' }} first={idx === 0}>
                                    {token.name}
                                  </td>
                                  <td first={idx === 0}>{token.balance}</td>
                                  <td>0.0000</td>
                                  <td>1.000</td>
                                  <td>
                                    <Link to={'/trades/' + token.symbol}>
                                      <FormattedMessage id="Move" />
                                    </Link>
                                  </td>
                                </tr>
                              )
                            })}
                        </tbody>
                      </table>
                    </div>
                  </form>
                </Col>
                {/* Right column */}
                <Col md={5} lg={4}>
                  <div className="card">
                    <h5 className="card-heading">
                      <FormattedMessage id="Account Resource" />
                    </h5>
                    <div className="card-body pb0">Cpu, Net, Ram</div>
                  </div>
                </Col>
              </Row>
            </Grid>
          </section>
        ) : (
          ''
        )}
      </Fragment>
    )
  }
}

export default compose(
  inject('marketStore', 'eosioStore', 'tradeStore', 'accountStore'),
  observer
)(Wallet)
