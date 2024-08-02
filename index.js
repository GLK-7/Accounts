//Módulos externos
const inquirer = require('inquirer');
const chalk = require('chalk');

//Módulos internos
const fs = require('fs');

operation();

function operation() {
  inquirer
    .prompt([
      {
        type: 'list',
        name: 'action',
        message: 'O que você deseja fazer?',
        choices: [
          'Criar Conta',
          'Consultar Saldo',
          'Depositar',
          'Sacar',
          'Sair',
        ],
      },
    ])
    .then((answer) => {
      const action = answer['action'];

      switch (action) {
        case 'Criar Conta':
          createAccount();
          break;
        case 'Consultar Saldo':
          getAccountBalance();
          break;
        case 'Depositar':
          deposit();
          break;
        case 'Sacar':
          withdraw();
          break;
        case 'Sair':
          console.log(chalk.bgBlue.black('Obrigado por usar o Accounts!'));
          process.exit();
      }
    })
    .catch((e) => console.log(e));
}

//create account
function createAccount() {
  console.log(chalk.bgGreen.black('Parabéns por escolher o nosso banco!'));
  console.log(chalk.green('Defina as opções da sua conta a seguir'));
  buildAccount();
}

function buildAccount() {
  inquirer
    .prompt([
      {
        name: 'accountName',
        message: 'Digite um nome para sua conta:',
      },
    ])
    .then((answer) => {
      const accountName = answer['accountName'];
      console.info(accountName);

      if (!fs.existsSync('accounts')) {
        fs.mkdirSync('accounts');
      }

      if (fs.existsSync(`accounts/${accountName}.json`)) {
        console.log(
          chalk.bgRed.black('Esta consta já existe, escolha outro nome')
        );
        return buildAccount();
      }

      fs.writeFileSync(
        `accounts/${accountName}.json`,
        '{"balance": 0}',
        function (e) {
          console.log(e);
        }
      );
      console.log(chalk.green('Parabéns, sua conta foi criada!'));
      operation();
    })
    .catch((e) => console.log(e));
}

// add an amount to user account
function deposit() {
  inquirer
    .prompt([
      {
        name: 'accountName',
        message: 'Qual o nome da sua conta?',
      },
    ])
    .then((answer) => {
      const accountName = answer['accountName'];

      if (!checkAccount(accountName)) {
        return deposit();
      }

      inquirer
        .prompt([
          {
            name: 'amount',
            message: 'Quanto você deseja depositar?',
          },
        ])
        .then((answer) => {
          const amount = answer['amount'];
          // add an amount
          addAmount(accountName, amount);
          operation();
        })
        .catch((e) => console.log(e));
    })
    .catch((e) => console.log(e));
}
// verify if account exists
function checkAccount(accountName) {
  if (!fs.existsSync(`accounts/${accountName}.json`)) {
    console.log(chalk.bgRed.black('Essa conta não existe, tente novamente!'));
    return false;
  }
  return true;
}
function addAmount(accountName, amount) {
  const accountData = getAccount(accountName);
  if (!amount) {
    console.log(
      chalk.bgRed.black('Ocorreu um erro, tente novamente mais tarde!')
    );
    return deposit();
  }

  accountData.balance = parseFloat(amount) + parseFloat(accountData.balance);

  fs.writeFileSync(
    `accounts/${accountName}.json`,
    JSON.stringify(accountData),
    function (e) {
      console.log(e);
    }
  );

  console.log(
    chalk.green(
      `Foi depositado o valor de R$${amount} na conta ${accountName}!`
    )
  );
}

function getAccount(accountName) {
  const accountJSON = fs.readFileSync(`accounts/${accountName}.json`, {
    encoding: 'utf8',
    flag: 'r',
  });

  return JSON.parse(accountJSON);
}

//show account balance
function getAccountBalance(accountName) {
  inquirer
    .prompt([
      {
        name: 'accountName',
        message: 'Qual o nome da sua conta?',
      },
    ])
    .then((answer) => {
      const accountName = answer['accountName'];

      if (!checkAccount(accountName)) {
        return getAccountBalance();
      }
      const accountBalance = getAccount(accountName).balance;
      console.log(
        chalk.bgBlue.black(
          `O saldo da conta ${accountName} é: R$${accountBalance}`
        )
      );
      operation();
    })
    .catch((e) => console.log(e));
}

function withdraw() {
  inquirer
    .prompt([
      {
        name: 'accountName',
        message: 'Qual é o nome da conta?',
      },
    ])
    .then((answer) => {
      const accountName = answer['accountName'];
      if (!checkAccount(accountName)) {
        return withdraw();
      }

      inquirer
        .prompt([
          {
            name: 'amount',
            message: 'Quanto você deseja sacar?',
          },
        ])
        .then((answer) => {
          const amount = answer['amount'];
          removeAmount(accountName, amount);
        })
        .catch((e) => console.log(e));
    })
    .catch((e) => console.log(e));
}

function removeAmount(accountName, amount) {
  const accountData = getAccount(accountName);
  if (!amount) {
    console.log(
      chalk.bgRed.black('Ocorreu um erro, tente novamente mais tarde!')
    );
    return withdraw();
  }

  if (accountData.balance < amount) {
    console.log(chalk.bgRed.black('Valor indisponível!'));
    return withdraw();
  }

  accountData.balance = parseFloat(accountData.balance) - parseFloat(amount);

  fs.writeFileSync(
    `accounts/${accountName}.json`,
    JSON.stringify(accountData),
    function (e) {
      console.log(e);
    }
  );

  console.log(
    chalk.green(`Foi sacado o valor de R$${amount} na conta ${accountName}!`)
  );
  operation();
}
