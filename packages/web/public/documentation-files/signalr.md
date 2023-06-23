# Websocket (BFF5)

### **URL: wss://{base-url-of-the-exchange}/ws**

[Methods](https://www.notion.so/666d56a6880544edbc4f8bc01092dc45)

[Events](https://www.notion.so/634c493e570a47edaa872c78453e7cd8)

# Subscriptions

- Authentication (Using Bearer Token)

    ```json
    Request:
    {
       "method":"login",
       "token":"your_bearer_token"
    }

    Response:
    {
       "method":"login",
       "status":"success",
       "message":"Logged in."
    }
    ```

- Authentication (Using API Keys)

    ```json
    // recvWindow: 45 sec
    Request:
    {
        "method": "login",
        "api": {
            "public_key": "api-public-key",
            "timestamp": 1608028160
        },
        "hmac": "computed-hmac-of-only-api-object"
    }

    Response:
    {
       "method":"login",
       "status":"success",
       "message":"Logged in."
    }
    ```

- Closing Authenticated Session

    ```json
    Request:
    {
    	"method":"logout"
    }

    Response:
    {
       "method":"logout",
       "status":"success",
       "message":"Logged out."
    }
    ```

- Subscribing Events

    ```json
    Request:
    {
       "method":"subscribe",
       "events":[
          "MK",
          "PO.ALL"
       ]
    }

    Response:
    {
       "method":"subscribe",
       "events":[
          {
             "event":"MK",
             "status":"success",
             "message":"Subscribed."
          },
          {
             "event":"PO.ALL",
             "status":"error",
             "message":"Access denied."
          }
       ]
    }

    Socket Updates:
    {
       "method":"stream",
       "event":"MK",
       "data":[
          {
              "base": "XLM",
              "quote": "BTC",
              "price": 600.00000000,
              "change_in_price": 119999900.00000000,
              "prev_price": 0.00050000,
              "base_volume": 29178.00000000,
              "quote_volume": 48.63000000,
              "full_name": "Stellar",
              "low_24hr": 0.00050000,
              "high_24hr": 600.00000000,
              "maker_fee": 1.00000000,
              "taker_fee": 2.00000000,
              "maker_fee_pro": 1.00000000,
              "taker_fee_pro": 2.00000000,
              "min_trade_amount": 0.00000001,
              "min_tick_size": 0.00000001,
              "min_order_value": 0.00000001
          }  
       ]
    }
    ```

- Unsubscribing Events

    ```json
    Request:
    {
       "method":"unsubscribe",
       "events":[
          "MK",
          "PO.ALL"
       ]
    }

    Response:
    {
       "method":"unsubscribe",
       "events":[
          {
             "event":"MK",
             "status":"success",
             "message":"Unsubscribed."
          },
          {
             "event":"PO.ALL",
             "status":"error",
             "message":"Access denied."
          }
       ]
    }
    ```

# Streaming Data Examples

- MK :: Markets

    ```json
    {
        "method": "stream",
        "event": "MK",
        "data": [
            {
                "base": "XLM",
                "quote": "BTC",
                "price": 600.00000000,
                "change_in_price": 119999900.00000000,
                "prev_price": 0.00050000,
                "base_volume": 29178.00000000,
                "quote_volume": 48.63000000,
                "full_name": "Stellar",
                "low_24hr": 0.00050000,
                "high_24hr": 600.00000000,
                "maker_fee": 1.00000000,
                "taker_fee": 2.00000000,
                "maker_fee_pro": 1.00000000,
                "taker_fee_pro": 2.00000000,
                "min_trade_amount": 0.00000001,
                "min_tick_size": 0.00000001,
                "min_order_value": 0.00000001
            },
            {
                "base": "BCH",
                "quote": "USD",
                "price": 600.00000000,
                "change_in_price": 100.00000000,
                "prev_price": 0.00000000,
                "base_volume": 29172.00000000,
                "quote_volume": 48.62000000,
                "full_name": "BCH",
                "low_24hr": 600.00000000,
                "high_24hr": 600.00000000,
                "maker_fee": 1.00000000,
                "taker_fee": 1.00000000,
                "maker_fee_pro": 1.00000000,
                "taker_fee_pro": 1.00000000,
                "min_trade_amount": 0.00000001,
                "min_tick_size": 0.00000001,
                "min_order_value": 0.00000001
            },
            {
                "base": "BTC",
                "quote": "USD",
                "price": 600.00000000,
                "change_in_price": -94.29588933,
                "prev_price": 10518.73000000,
                "base_volume": 3690.00000000,
                "quote_volume": 6.15000000,
                "full_name": "BTC",
                "low_24hr": 600.00000000,
                "high_24hr": 600.00000000,
                "maker_fee": 1.00000000,
                "taker_fee": 1.00000000,
                "maker_fee_pro": 1.00000000,
                "taker_fee_pro": 1.00000000,
                "min_trade_amount": 0.00000001,
                "min_tick_size": 0.00000001,
                "min_order_value": 0.00000001
            }
        ]
    }
    ```

- OB :: Order Books

    ```json
    // bid/ask, array of [price,size] 
    {
       "method":"stream",
       "event":"OB.BTC_USD",
       "data":{
          "bids":[
             599.0000000,
             212.2500000
          ],
          "asks":[
             [
                600.00000000,
                125.27000000
             ]
          ]
       }
    }
    ```

- RT :: Recent Trades

    ```json
    // Recent 100 trades, sent every second
    {
       "method":"stream",
       "event":"RT.BTC_USD",
       "data":[
          {
             "order_id": 1607425823,
             "rate": 600.00000000,
             "volume": 0.01000000,
             "execution_side": "BUY",
             "timestamp": "2020-12-08T11:10:23.442Z"
          },
    			{
             "order_id": 1607425823,
             "rate": 600.00000000,
             "volume": 0.01000000,
             "execution_side": "BUY",
             "timestamp": "2020-12-08T11:10:23.442Z"
          }
       ]
    }
    ```

- OT :: Order Book Totals

    ```json
    {
       "method":"stream",
       "event":"OT.BTC_USD",
       "data":{
          "total_buys_base":0.0,
          "total_buys_quote":0.0,
          "total_sells_base":125.27,
          "total_sells_quote":75162.0
       }
    }
    ```

- CH :: Charts

    ```json
    // BTC_USD charts for 1 minute interval.
    {
       "method":"stream",
       "event":"CH.BTC_USD.1",
       "data":{
          "time":1607938920000,
          "open":600.00000000,
          "close":600.00000000,
          "high":600.00000000,
          "low":600.00000000,
          "volume":0.00000000
       }
    }
    ```

- BL :: Balances

    ```json
    {
       "method":"stream",
       "event":"BL",
       "data":{
          "ALGO":{
             "balance":0.0,
             "balance_in_trade":0.0
          },
          "BCH":{
             "balance":0.0,
             "balance_in_trade":0.0
          },
          "BTC":{
             "balance":0.0,
             "balance_in_trade":0.0
          },
    			"EUR": {
             "balance": 580.0,
             "balance_in_trade": 270.0
          }
       }
    }
    ```

- PO :: Pending Orders

    ```json
    {
       "method":"stream",
       "event":"PO.ALL",
       "data":[
          {
             "order_id": 123722351,
             "user_id": 102999,
             "base": "ETH",
             "quote": "EUR",
             "rate": 20.00000000,
             "volume": 1.50000000,
             "pending": 1.50000000,
             "type": "LIMIT",
             "tif": "GTC",
             "side": "BUY",
             "timestamp": "2020-12-14T10:12:23.8824761Z"
          }
       ]
    }
    ```

    ```json
    {
       "method":"stream",
       "event":"PO.ETH_EUR",
       "data":[
          {
             "order_id": 123722351,
             "user_id": 102999,
             "base": "ETH",
             "quote": "EUR",
             "rate": 20.00000000,
             "volume": 1.50000000,
             "pending": 1.50000000,
             "type": "LIMIT",
             "tif": "GTC",
             "side": "BUY",
             "timestamp": "2020-12-14T10:12:23.8824761Z"
          }
       ]
    }
    ```