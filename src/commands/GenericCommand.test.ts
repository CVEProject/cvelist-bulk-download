import { Command } from 'commander';
import { GenericCommand } from './GenericCommand.js';

/** thin instantiable class to test the abstract GenericCommand class */
class SimpleTestCommand extends GenericCommand {
  constructor(program: Command) {
    super('test', program);
  }
}

describe(`GenericCommand`, () => {


  it(`correctly resets the timer to the current timestamp (close enough)`, async () => {
    const program = new Command();
    const cmd = new SimpleTestCommand(program);
    const now = Date.now();
    expect(cmd._name).toMatch('test');
    expect(cmd._program).toBe(program);
    // can't gurantee the difference to be 0, so using a larger range
    expect(cmd.timerReset() - now).toBeLessThan(5);
  });


});
