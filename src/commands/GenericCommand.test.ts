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
    expect(cmd._name).toMatch('test');
    expect(cmd._program).toBe(program);
    // time based issues cant garuntee deterministic runs, 
    // for now check in a more deterministic way.
    const before = Date.now();
    const during = cmd.timerReset();
    const after = Date.now();
    expect(before).toBeLessThanOrEqual(during);
    expect(after).toBeGreaterThanOrEqual(during);
  });


});
