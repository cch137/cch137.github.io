['7','8','9','abc'].forEach(value => {
  ((_input) => {
    const answer = 8;
    const user_guess = parseFloat(_input);
    if (Number.isNaN(user_guess)) {
      console.log('Input is not a NUMBER!');
      return;
    }
    if (user_guess === answer) {
      console.log(`${answer} is the number!`);
    } else {
      console.log(`Too ${user_guess > answer ? 'Large' : 'Small'}!`);
    }
  })(value);
});