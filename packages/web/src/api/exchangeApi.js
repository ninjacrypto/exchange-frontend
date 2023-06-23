import axios from 'axios';
import qs from 'qs';

export class ExchangeApi {
  constructor({ config, handleError }) {
    this.instance = axios.create(config);
    this.authenticatedInstance = axios.create(config);
    this.instance.interceptors.response.use(this.handleSuccess, handleError);
    this.authenticatedInstance.interceptors.response.use(
      this.handleSuccess,
      handleError,
    );
  }

  authenticatedCall = async ({
    url,
    method = 'GET',
    headers = {},
    data,
  }) => {
    const updatedHeaders = {
      ...headers,
    };

    if (method === 'POST') {
      return this.authenticatedInstance({
        url,
        method,
        headers: updatedHeaders,
        data,
      });
    } else if (method === 'GET') {
      return this.authenticatedInstance({
        url: `${url}?${qs.stringify(data)}`,
        method,
        headers: updatedHeaders,
      });
    }
  };

  handleSuccess(response) {
    const { data } = response;

    if (data.status === 'Success') {
      return data;
    }

    if (data.status === 'Error') {
      return data;
    }

    return Promise.reject(data);
  }

  setAuthentication(token) {
    this.authenticatedInstance.defaults.headers['Authorization'] =  token?.startsWith("Bearer") ? token: `Bearer ${token}`;
  }

  clearAuthentication() {
    delete this.authenticatedInstance.defaults.headers['Authorization'];
  }

  // Address Book
  getAddressWhitelistStatus = async () => {
    return await this.authenticatedCall({
      method: 'GET',
      url: '/api/Get_Withdrawal_Address_Whitelisting_Status',
    });
  };

  setAddressWhitelistStatus = async (enable = true) => {
    const url = enable
      ? '/api/Enable_Withdrawal_Address_Whitelisting'
      : '/api/Disable_Withdrawal_Address_Whitelisting';

    return await this.authenticatedCall({
      method: 'POST',
      url,
    });
  };

  getAddressBook = async (currency = 'ALL') => {
    return await this.authenticatedCall({
      method: 'POST',
      url: '/api/Get_AddressBook',
      data: {
        Currency: currency,
      },
    });
  };

  addToAddressBook = async ({
    currency: Currency,
    label: Label,
    address: Address,
    memo: DT_Memo,
    gauth_code: gauth_code,
    smsotp,
    smstoken: smstoken,
    emailotp,
    emailtoken: emailtoken
  }) => {
    return await this.authenticatedCall({
      method: 'POST',
      url: '/api/Add_AddressBook',
      data: {
        Currency,
        Label,
        Address,
        gauth_code,
        DT_Memo,
        gauth_code,
        smsotp,
        smstoken,
        emailotp,
        emailtoken,
      },
    });
  };

  requestAddressBookOtp = async ({
    currency: Currency,
    address: Address,
    memo: DT_Memo,
  }) => {
    return await this.authenticatedCall({
      method: 'POST',
      url: '/api/request-otp-addressbook',
      data: {
        Currency,
        Address,
        DT_Memo,
      },
    });
  };

  removeFromAddressBook = async ({ label: Label, id: ID }) => {
    return await this.authenticatedCall({
      method: 'POST',
      url: '/api/Delete_AddressBook',
      data: {
        Label,
        ID,
      },
    });
  };

  // Fiat Customer Accounts
  getFiatCustomerAccounts = async () => {
    return await this.authenticatedCall({
      method: 'GET',
      url: '/api/Get_Fiat_CustomerAccounts',
    });
  };

  addFiatCustomerAccount = async ({
    BankName: BankName,
    AccountCurrency: AccountCurrency,
    AccountType: AccountType,
    AccountNumber: AccountNumber,
    BankRoutingCode: BankRoutingCode,
    SwiftCode: SwiftCode,
    gauth_code: gauth_code,
    smsotp,
    smstoken: smstoken,
    emailotp,
    emailtoken: emailtoken
    }) => {
    return await this.authenticatedCall({
      method: 'POST',
      url: '/api/Add_Fiat_CustomerAccount',
      data: {
        BankName,
        AccountCurrency,
        AccountType,
        AccountNumber,
        BankRoutingCode,
        SwiftCode,
        gauth_code,
        smsotp,
        smstoken,
        emailotp,
        emailtoken,
      },
    });
  };
  

  requestFiatCustomerAccountOtp = async ({
    BankName: BankName,
    AccountCurrency: AccountCurrency,
    AccountNumber: AccountNumber,
  }) => {
    return await this.authenticatedCall({
      method: 'POST',
      url: '/api/Request-otp-fiat-customer-accounts',
      data: {
        BankName,
        AccountCurrency,
        AccountNumber,
      },
    });
  };

  removeFiatCustomerAccount = async (id) => {
    return await this.authenticatedCall({
      method: 'POST',
      url: '/api/Delete_Fiat_Account',
      data: id,
    });
  };

  // Affilate
  getAffiliateSummary = async () => {
    return await this.authenticatedCall({
      method: 'GET',
      url: '/api/Affiliate_Summary',
    });
  };

  getAffiliateSummaryStats = async () => {
    return await this.authenticatedCall({
      method: 'GET',
      url: '/api/Affiliate_Summary_stats',
    });
  };

  getAffilateReferrals = async () => {
    return await this.authenticatedCall({
      method: 'GET',
      url: '/api/My_Affiliate',
    });
  };

  getAffiliateCommission = async () => {
    return await this.authenticatedCall({
      method: 'GET',
      url: '/api/Affiliate_Commission',
    });
  };

  // Withdrawals
  requestWithdrawalCode = async values => {
    return await this.authenticatedCall({
      method: 'POST',
      url: '/api/RequestWithdraw_EmailOTP',
      data: values,
    });
  };

  // Orders
  placeOrder = async values => {
    return await this.authenticatedCall({
      method: 'POST',
      url: '/api/PlaceOrder',
      data: values,
    });
  };

  // Insta Trade
  getInstaTradePairs = async () => {
    return await this.instance({
      method: 'GET',
      url: '/api/get_insta_pairs',
    });
  };

  submitInstaTrade = async values => {
    return await this.authenticatedCall({
      method: 'POST',
      url: '/api/request_insta_trade',
      data: values,
    });
  };

  getInstaTradeHistory = async (isSimplex = false) => {
    return await this.authenticatedCall({
      method: 'POST',
      url: `/api/get_insta_trades${isSimplex ? '/simplex' : ''}`,
    });
  };

  getAllTransactions = async () => {
    return await this.authenticatedCall({
      method: 'GET',
      url: '/api/Get_All_Transactions',
    });
  };

  // Market and Currency Data
  getCryptoRateList = async () => {
    return await this.instance({
      method: 'GET',
      url: '/api/get_crypto_price'
    })
  }

  getFiatRateList = async () => {
    return await this.instance({
      method: 'GET',
      url: '/api/get_fiat_price'
    })
  }

  getCryptocurrencyInfo = async () => {
    return await this.instance({
      method: 'GET',
      url: '/api/get_coin_stats'
    })
  }

  getIPWhitelist = async () => {
    return await this.instance({
      method: 'GET',
      url: '/api/Get_IP_Whitelist'
    })
  }

  getDeviceWhitelist = async () => {
    return await this.instance({
      method: 'GET',
      url: '/api/list-whitelisted-devices'
    })
  }

  addOnIPWhitelist = async ({
    cidr,
    type
  }) => {

    return await this.authenticatedCall({
      method: 'POST',
      url: '/api/Add_IP_Whitelist',
      data: {
        cidr:  cidr + '/32',
        type
      },
      addAdditionalData: false,
    });
  };

  removeFormIPWhitelist = async ({
    cidr,
    type
  }) => {
    return await this.authenticatedCall({
      method: 'POST',
      url: '/api/Delete_IP_Whitelist',
      data: {
        cidr,
        type
      },
      addAdditionalData: false,
    });
  };

  removeFormDeviceWhitelist = async ({
    id
  }) => {
    return await this.authenticatedCall({
      method: 'POST',
      url: '/api/delete-whitelisted-device',
      data: {
        id
      },
      addAdditionalData: false,
    });
  };

  requestTransferBalance = async (data) => {
    return await this.authenticatedCall({
      method: 'POST',
      url: '/derivatives/transfer-balance',
      data: data,
      addAdditionalData: false,
    });
  };

  requestTransferBalanceOKX = async (data) => {
    return await this.authenticatedCall({
      method: 'POST',
      url: '/okx/transfer-fund',
      data: data,
      addAdditionalData: false,
    });
  };

  requestMoveFunds = async (data) => {
    return await this.authenticatedCall({
      method: 'POST',
      url: '/okx/move-fund',
      data: data,
      addAdditionalData: false,
    });
  };
  
  addbankACH = async ({
    BankName: bankname,
    AccountType: type,
    AccountNumber: account,
    BankRoutingCode: routing,
    tempToken: token,
    }) => {
    return await this.authenticatedCall({
      method: 'POST',
      url: '/checkbook/add-bank',
      data: {
        bankname,
        type,
        account,
        routing,
        token,
      },
    });
  };

  removeFiatdepositrequest = async (id) => {
    return await this.authenticatedCall({
      method: 'POST',
      url: '/api/Cancel_Fiat_Manual_Deposit_Request',
      data: id,
    });
  };

  removeFiatWithdrawalrequest = async (id) => {
    return await this.authenticatedCall({
      method: 'POST',
      url: '/api/Cancel_Fiat_Manual_Withdrawal_Request',
      data: id,
    });
  };
}

