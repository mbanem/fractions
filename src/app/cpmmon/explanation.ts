import { Fraction } from "./utils";
import { forEachTrailingCommentRange } from "typescript";

export class StoryTeller {
  public static explain() {
    return (
      'In column "Fractions" of the second row enter a fraction, numerator / denominator , for instance<br>' +
      Fraction.fraction(1, 6).result +
      "<br>and in the same column in the third row enter another fraction, say<br>" +
      Fraction.fraction(5, 12).result +
      '<br> As you press Enter key or remove focus from the cell the program will divide the left part of the row in as many equal peaces as is the denominator of the fraction. In order to add that two fractions they have to have equal denominators. On the right side the denominators are shown as products of the prime numbers i.e. factors and by pressing on any "expand" button the fractions will be expanded into ones with equal denominators. When you hover mouse pointer over such expanded fractions you will see what fraction values they are equal to. Now we can add their numerators 2 + 5  to get the sum of the two fractions:<br>' +
      Fraction.fraction(1, 6)
        .operand("*")
        .fraction(2, 2)

        .operand("+")
        .fraction(5, 12)
        .operand("=")

        .fraction(`1*2`, `6*2`)
        .operand("+")
        .fraction(5, 12)
        .operand("=")
        .fraction(2, 12)
        .operand("+")
        .fraction(5, 12)
        .operand("=")
        .fraction(7, 12).result
    );
  }
}
