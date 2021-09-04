function ordinal(number) {
    const english_ordinal_rules = new Intl.PluralRules("en", {
        type: "ordinal"
    });
    const suffixes = {
        one: "st",
        two: "nd",
        few: "rd",
        other: "th"
    }
    const suffix = suffixes[english_ordinal_rules.select(number)];
    return (number + suffix);
}

let date = new Date()
date.setDate(date.getDate() + 3)
const month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
export const deliverydate = days[date.getDay()] + " " + ordinal(date.getDate()) + " " + month[date.getMonth()]