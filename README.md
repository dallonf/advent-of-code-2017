# Advent of Code 2017

http://adventofcode.com/2017

## Instructions to run

```
yarn install
yarn compile
yarn runall
```

My solutions are not the most efficient, so it might take a few minutes to get through all the challenges.

Also note that Day 23 is asynchronous, so it will appear at the end, after Day 25.

## Retrospective

This was a really fun challenge! It really tested my skills by giving me problems that I haven't dealt with very often in real-world UI development. There were a lot of algorithms with complex runtimes, so I had to think both about making each iteration run faster and how to rearrange the algorithm to use less iterations overall.

My favorite days were [Day 7: Recursive Circus](http://adventofcode.com/2017/day/7), which had me crawling a traversing a tree looking for one element out of alignment, and [Day 13: Packet Scanners](https://adventofcode.com/2017/day/13), which had a fun stealth-game theme to it; it was also the first one to rev up my CPU fan and force me to think about optimization.

My least favorite was probably [Day 23: Coprocessor Conflagration](http://adventofcode.com/2017/day/23); analyzing assembly-like code is really not something I'm familiar with and it took me over 8 hours to figure out what it was doing. (Although a couple of those hours were spent under the delusion that a constraint solver that executed the program in reverse would be able to get to the solution much faster. I'm pretty proud of the constraint solver, tbh... even though it's no more successful at running the program in a reasonable amount of time, it does seem to do what it's supposed to.)

I needed help from the [subreddit](https://www.reddit.com/r/adventofcode/) on Days 16 and 23. The community was very helpful in sharing hints that got me on the right track without spoiling the solution - so helpful, in fact, that I didn't actually have to ask. Just browsing around was enough to inspire me to get back at it!
