import { sub } from 'date-fns';

import { DateCommand } from './DateCommand.js';

import { Command } from 'commander';


describe(`DateCommand`, () => {
    let consoleHistory = null;
    let mockConsoleLog = null;
    beforeEach(() => {
        // Reset console history
        consoleHistory = [];
        // overrides console.log to store the logged values in `consoleHistory`
        mockConsoleLog = jest.spyOn(global.console, 'log').mockImplementation((e) => {
            // keep track of logged value
            consoleHistory.push(e);
        });
        // double checking for sanity
        expect(console.log).toBe(mockConsoleLog);
    });
    afterEach(() => {
        // Restore console.log for global usage.
        mockConsoleLog.mockRestore();
        // double checking for sanity
        expect(console.log).not.toBe(mockConsoleLog);
    });

    // TODO: break up this test? 
    // chaining the different options together to make testing fairly simple?
    it(`Test midnight, midnightYesterday, and yesterday.`, async () => {

        expect(console.log).toBe(mockConsoleLog);   // double checking for sanity
        // idk how to do it properly, but this does not get picked up by coverage?
        let dc = new DateCommand(new Command());
        await dc.run({ midnight: true, terse: true });

        expect(consoleHistory.length).toBeGreaterThanOrEqual(1);
        // ensure midnight. TODO: check date as well? i suspect timezone shenanigans.
        expect(consoleHistory[0].endsWith('T00:00:00.000Z')).toBeTruthy();

        // test midnight yesterday. be sure its different than history[0]
        await dc.run({ midnightYesterday: true, terse: true })

        expect(consoleHistory.length).toBeGreaterThanOrEqual(2);
        // ensure midnight. TODO: check date as well? i suspect timezone shenanigans.
        expect(consoleHistory[1].endsWith('T00:00:00.000Z')).toBeTruthy();
        expect(consoleHistory[0]).not.toEqual(consoleHistory[1]);
        // expected exactly 24hrs apart.
        const msInADay = 24 * 60 * 60 * 1000;
        expect(new Date(consoleHistory[0]).getTime() - new Date(consoleHistory[1]).getTime()).toEqual(msInADay);

        // test yesterday. be sure ms between that and consoleHistory[1] is under msInADay
        await dc.run({ yesterday: true, terse: true });
        expect(consoleHistory.length).toBeGreaterThanOrEqual(3);
        expect(new Date(consoleHistory[2]).getTime() - new Date(consoleHistory[1]).getTime()).toBeLessThan(msInADay);
    });
});