<template>
  <v-container>
    <v-col>
      <v-card class="body-1 px-6 py-8 mb-4" max-width="800" outlined>
        <h1 class="headline">Digital Asset Accounts (DAA)</h1>

        <p class="mt-6">
          Make API calls against the Digital Asset Accounts endpoints
          (<code>/v1/accounts</code>, <code>/v1/banks</code>,
          <code>/v1/addresses</code>). Use the optional
          <strong>Client Entity Id</strong> filter (and Risk Signals in Settings
          for wire accounts) for 3rd-party flows.
        </p>
      </v-card>

      <v-card class="body-1 px-6 py-8 mb-4" max-width="800" outlined>
        <h2 class="title">Account endpoints</h2>
        <span class="caption">Requires: api key</span>
        <br /><br />
        <p>Api endpoints to create and retrieve accounts and subaccounts.</p>
        <p>
          <v-chip small color="primary warning">POST</v-chip>
          <a href="/debug/daa/accounts/create">Create account</a>
        </p>
        <p>
          <v-chip small color="primary">GET</v-chip>
          <a href="/debug/daa/accounts/fetch">Get all accounts</a>
        </p>
        <p>
          <v-chip small color="primary">GET</v-chip>
          <a href="/debug/daa/accounts/details">Get account by id</a>
        </p>
      </v-card>

      <v-card class="body-1 px-6 py-8 mb-4" max-width="800" outlined>
        <h2 class="title">Wire endpoints</h2>
        <span class="caption">Requires: api key, risk signals</span>
        <br /><br />
        <p>Api endpoints to manage wire bank accounts.</p>
        <p>
          <v-chip small color="primary warning">POST</v-chip>
          <a href="/debug/daa/wires/create">Create wire account</a>
        </p>
        <p>
          <v-chip small color="primary">GET</v-chip>
          <a href="/debug/daa/wires/fetch">Get all wire accounts</a>
        </p>
        <p>
          <v-chip small color="primary">GET</v-chip>
          <a href="/debug/daa/wires/details">Get wire account by id</a>
        </p>
        <p>
          <v-chip small color="primary">GET</v-chip>
          <a href="/debug/daa/wires/instructions">
            Get wire instructions for id
          </a>
        </p>
      </v-card>

      <v-card class="body-1 px-6 py-8 mb-4" max-width="800" outlined>
        <h2 class="title">Transfer endpoints</h2>
        <span class="caption">Requires: api key</span>
        <br /><br />
        <p>Api endpoints to manage transfers.</p>
        <p>
          <v-chip small color="primary warning">POST</v-chip>
          <a href="/debug/daa/transfers/create">Create transfer</a>
        </p>
        <p>
          <v-chip small color="primary">GET</v-chip>
          <a href="/debug/daa/transfers/fetch">Get all transfers</a>
        </p>
        <p>
          <v-chip small color="primary">GET</v-chip>
          <a href="/debug/daa/transfers/details">Get transfer by id</a>
        </p>
      </v-card>

      <v-card class="body-1 px-6 py-8 mb-4" max-width="800" outlined>
        <h2 class="title">Transaction endpoints</h2>
        <span class="caption">Requires: api key</span>
        <br /><br />
        <p>Unified view of transaction activity across account types.</p>
        <p>
          <v-chip small color="primary">GET</v-chip>
          <a href="/debug/daa/transactions/fetch">Get all transactions</a>
        </p>
      </v-card>

      <v-card class="body-1 px-6 py-8 mb-4" max-width="800" outlined>
        <h2 class="title">Withdrawal endpoints</h2>
        <span class="caption">Requires: api key</span>
        <br /><br />
        <p>Api endpoints to manage bank withdrawals.</p>
        <p>
          <v-chip small color="primary warning">POST</v-chip>
          <a href="/debug/daa/withdrawals/create">Create withdrawal</a>
        </p>
        <p>
          <v-chip small color="primary">GET</v-chip>
          <a href="/debug/daa/withdrawals/fetch">Get all withdrawals</a>
        </p>
        <p>
          <v-chip small color="primary">GET</v-chip>
          <a href="/debug/daa/withdrawals/details">Get withdrawal by id</a>
        </p>
      </v-card>

      <v-card class="body-1 px-6 py-8 mb-4" max-width="800" outlined>
        <h2 class="title">Address endpoints</h2>
        <span class="caption">Requires: api key</span>
        <br /><br />
        <p>Api endpoints to manage blockchain addresses.</p>
        <p>
          <v-chip small color="primary warning">POST</v-chip>
          <a href="/debug/daa/addresses/deposit/create">
            Create deposit address
          </a>
        </p>
        <p>
          <v-chip small color="primary">GET</v-chip>
          <a href="/debug/daa/addresses/deposit/fetch">
            Get all deposit addresses
          </a>
        </p>
        <p>
          <v-chip small color="primary warning">POST</v-chip>
          <a href="/debug/daa/addresses/recipient/create">
            Create recipient address
          </a>
        </p>
        <p>
          <v-chip small color="primary">GET</v-chip>
          <a href="/debug/daa/addresses/recipient/fetch">
            Get all recipient addresses
          </a>
        </p>
        <p>
          <v-chip small color="primary accent">DELETE</v-chip>
          <a href="/debug/daa/addresses/recipient/delete">
            Delete selected recipient address
          </a>
        </p>
      </v-card>

      <v-card class="body-1 px-6 py-8 mb-4" max-width="800" outlined>
        <h2 class="title">Deposit endpoints</h2>
        <span class="caption">Requires: api key</span>
        <br /><br />
        <p>Api endpoints to manage deposits.</p>
        <p>
          <v-chip small color="primary">GET</v-chip>
          <a href="/debug/daa/deposits/fetch">Get all deposits</a>
        </p>
      </v-card>
    </v-col>
  </v-container>
</template>

<script setup lang="ts"></script>
