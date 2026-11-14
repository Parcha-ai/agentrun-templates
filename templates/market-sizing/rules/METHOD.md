# How to size, in short

## Define first

Product boundary, buyer, unit of sale, revenue basis, region. Three revenue bases give three different numbers for the
same market:

- `end_user_spend`: what buyers pay, including channel margin.
- `vendor_revenue`: what the sellers book.
- `wholesale`: what the first sale in the chain brings.

State the one you use. A published estimate on another basis is converted only with a stated method, or reported as it
stands with the difference named.

## The bottom-up formula

    annual market = buyers x adoption rate x annual spend per adopting buyer

Add purchase frequency, units per buyer or a pricing tier mix where the market needs them. Each factor is one input
row: `base`, plus `low` and `high` when you are unsure. A `fact` input has a page; a `calculation` input shows its
derivation; an `inference` input has `reasoning` and a range.

## Arithmetic

You have no calculator. Write each step as one line with its intermediate value, in the same units throughout:

    buyers 40,000 x adoption 0.25 = 10,000 adopting buyers
    10,000 x $3,000 per year = $30,000,000 = 30 usd_m

Then repeat the whole chain and check you get the same result. Low uses every input's `low`, high every `high`, base
every `base`. Convert to millions of dollars (`usd_m`) only at the end.

## Tiers

- TAM: everyone who would buy the defined product in the region, in the base year.
- SAM: the part you can reach with the stated segment, region and channel.
- SOM: what a realistic player could capture in three to five years, taken from comparable shares or ramp rates. Always
  `inference`.

## Ranges, not points

Give a low, base and high for anything not a fact. A single number with no range suggests precision the sources do not
have.

## Sensitivity

Change the two or three inputs with the most leverage (usually adoption and spend per buyer), one case at a time or
together as the low and high cases, and show the result of each.

## Reconcile

Top-down and bottom-up rarely match. The gap is information: different scope, base year or revenue basis; adoption
guessed too high or low; a segment one method leaves out. Say which, and which figure you trust more and why.

## Never

- Average published estimates without explaining the scope.
- Present a vendor's press-release figure as an independent fact.
- Fill a missing input with a number you cannot justify.
- Recommend investing or not investing.
