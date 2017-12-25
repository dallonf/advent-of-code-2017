The answer for Part One is 1868. I just want to find a more efficient solution for it. (evaluate your optimizations against this answer)

Strategies so far:

* Brute force: worked but takes a long time
* Do a depth-first search, and don't keep crawling the graph if you couldn't exceed the best bridge seen so far, even if you hypothetically connected every remaining piece in the graph (excluding orphaned pieces): didn't actually exclude any possibilities.
* Just find the best single piece at every step: returned a very suboptimal answer
* Find the best combination of N pieces at a time, then lock it in and find the next combination: returned a suboptimal answer. To my surprise, increasing N didn't seem to be correlated with a more optimal solution.

Wound up just going with brute force. It didn't take THAT long. /shrug
