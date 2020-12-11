export class WFraction {
  // for dynammically insertd strings into innerHTML css file is
  // unreachable so the inserted string must contain local <style>
  // block, which is leading part of string to be generated
  // for fraction expressions, like 1/2 + 1/3 = 1/2 *3/3 + 1/3*2/2 = 5/6
  private s = `
  <style>
  .fract,
  .fract-bold,
  .fract-bold-red {
    position:relative;
    display: inline-flex;
    flex-direction: column;
    padding: -4px 2px -4px 2px;
    align-items: center;
  }
   .fract-bold{
    font-weight: bolder;
  }
  .fract-bold-red{
    color:red;
  }
  .numerator {
    border-bottom: 2px solid grey;
  }
  .operator{
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    line-height: 5px;
  }
  .whole{
    display:inline-block;
    vertical-align:bottom;
    line-height:40px;
    font-size:30px;
    font-weight:100;
  }
  </style>`;

  // returns generated string done in several steps
  // using the following operators
  get result() {
    return this.s; // make chained operation possible
  }
  // just append anything to the above private field s
  public append(str: string) {
    this.s += str;
    return this;
  }
  // renders a correct fraction numerator above a denominator below
  // vertically adjusted in a column
  public fraction(n: string | number, d: string | number) {
    this.s += `<span class="fract">
      <span class="numerator">${n}</span>
      <span>${d}</span>
    </span>`;
    return this;
  }
  public fractionBold(n: string | number, d: string | number) {
    this.s += `<span class="fract-bold">
      <span class="numerator">${n}</span>
      <span>${d}</span>
    </span>`;
    return this;
  }
  // bold red fraction for emphasize
  public fractionBoldRed(n: string | number, d: string | number) {
    this.s += `<span class="fract-bold-red">
      <span class="numerator">${n}</span>
      <span>${d}</span>
    </span>`;
    return this;
  }
  // usually + - * or /, but could be anything
  // adjusted to the horizontal line betwwe numerator and denominator
  public operand(op: string) {
    this.s += `<span class="fract">
      <span class="numerator"></span>
      <span class="operator">${op}</span>
    </span>`;
    return this;
  }
  public isProper(num, denom) {
    if (num < denom) {
      return this;
    }
    this.operand('=');
    const whole = Math.floor(num / denom);
    const part = num % denom;
    const txt = `<span class='whole'>${whole} </span> `;
    this.s += txt;
    if (part > 0) {
      this.fraction(part, denom);
    } else {
      this.s += '';
    }
    return this;
  }
}
export class Fraction {
  public static fraction(n: string | number, d: string | number) {
    return new WFraction().fraction(n, d);
  }
  public static operand(op: string) {
    return new WFraction().operand(op);
  }
  public static fractionBold(n: string | number, d: string | number) {
    return new WFraction().fractionBoldRed(n, d);
  }
  public static fractionBoldRed(n: string | number, d: string | number) {
    return new WFraction().fractionBoldRed(n, d);
  }
  public static isProper(num, denom) {
    return new WFraction().isProper(num, denom);
  }
}
// static methods to lower burden in the main page
export class Utils {
  public static toggleName(el) {
    if (el.innerText.slice(0, 3) === 'Mar') {
      el.innerHTML = 'Mia Milutinovi&#263;';
      el.className = 'student-name-red';
    } else {
      el.innerHTML = 'Marko Milutinovi&#263;';
      el.className = 'student-name-black';
    }
  }

  // fractions have properties f1 to f5 and f2+f3 should be equal f5
  // it should be called only when th sum is correct
  public static expressionForSum(fractions: object) {
    const ems = [];
    try {
      for (const key in fractions) {
        //        m[0]      m[1]       m[2]
        if (fractions[key]) {
          ems.push(fractions[key].match(/^(\d+)\/(\d+)/)); // ems: [ fraction, numerator, denomminator ]
        } else {
          ems.push('empty');
        }
      }
      const c1 = +ems[4][2] / +ems[1][2];
      const c2 = +ems[4][2] / +ems[2][2];

      const frac = Fraction.fractionBoldRed(ems[1][1], ems[1][2])
        .operand('+')
        .fractionBoldRed(ems[2][1], ems[2][2]);
      const c11 = c1 * +ems[1][1];
      const c12 = c1 * +ems[1][2];
      const c21 = c2 * +ems[2][1];
      let result = null;
      if (c1 > 1 && c2 > 1) {
        result = frac
          .operand('=')
          .fraction(ems[1][1], ems[1][2])
          .operand('*')
          .fractionBoldRed(c1, c1)
          .operand('+')
          .fraction(ems[2][1], ems[2][2])
          .operand('*')
          .fractionBoldRed(c2, c2)
          .operand('=')
          .fraction(`${ems[1][1]}*${c1}`, `${ems[1][2]}*${c1}`)
          .operand('+')
          .fraction(`${ems[2][1]}*${c2}`, `${ems[2][2]}*${c2}`)
          .operand('=')
          .fraction(c11, c12)
          .operand('+')
          .fraction(c21, c12)
          .operand('=')
          .fraction(c11 + '+' + c21, c12)
          .operand('=')
          .fractionBoldRed(c11 + c21, c12)
          .isProper(c11 + c21, c12).result;
      } else if (c2 > 1) {
        result = frac
          .operand('=')
          .fraction(ems[1][1], ems[1][2])
          .operand('+')
          .fraction(ems[2][1], ems[2][2])
          .operand('*')
          .fractionBoldRed(c2, c2)
          .operand('=')
          .fraction(ems[1][1], ems[1][2])
          .operand('+')
          .fraction(`${ems[2][1]}*${c2}`, `${ems[2][2]}*${c2}`)
          .operand('=')
          .fraction(ems[1][1], ems[1][2])
          .operand('+')
          .fraction(+ems[2][1] * c2, c12)
          .operand('=')
          .fractionBoldRed(+ems[1][1] + c21, c12)
          .isProper(+ems[1][1] + c21, c12).result;
      } else if (c1 > 1) {
        result = frac
          .operand('=')
          .fraction(ems[1][1], ems[1][2])
          .operand('*')
          .fractionBoldRed(c1, c1)
          .operand('+')
          .fraction(ems[2][1], ems[2][2])
          .operand('=')

          .fraction(`${ems[1][1]}*${c1}`, `${ems[1][2]}*${c1}`)
          .operand('+')
          .fraction(ems[2][1], ems[2][2])
          .operand('=')

          .fraction(+ems[1][1] * c1, c12)
          .operand('+')
          .fraction(ems[2][1], ems[2][2])
          .operand('=')
          .fractionBoldRed(c11 + c21, c12)
          .isProper(c11 + c21, c12).result;
      }
      return result;
    } catch (err) {
      return err;
    }
  }
  // LOwest Common Denominator for two numbers
  public static gcd = (n1: number, n2: number) => {
    return n1 ? Utils.gcd(n2 % n1, n1) : n2;
  }
  public static lcd(n1: number, n2: number) {
    let result = Utils.gcd(n1, n2);
    try {
      result = (n1 * n2) / result;
      return result;
    } catch (err) {
      return null;
    }
  }
  // extracts denominator from a given fraction as a string as a
  // numeric would go into a float without using special library
  public static denominator(fraction: string) {
    try {
      return fraction.match(/^\d+\/(\d+)/)[1];
    } catch {
      return null;
    }
  }

  public static primeFactors = (num: number): string => {
    if (num < 4) {
      return num.toString();
    }
    const primeFactors = [];
    while (num % 2 === 0) {
      primeFactors.push(2);
      num = num / 2;
    }

    const sqrtNum = Math.sqrt(num);
    for (let i = 3; i <= sqrtNum; i++) {
      while (num % i === 0) {
        primeFactors.push(i);
        num = num / i;
      }
    }

    if (num > 2) {
      primeFactors.push(num);
    }
    return primeFactors.join('*');
  }
  // fractions={f0:'',f1:'',...,f4:''} hold input values (whole numbers or fractions)transformed
  // on input via (change) handler fractionInputOnChange calling this function to ppopulate
  // this.m[0..3] in format this.m[0..3]["f0..f3", numerator, denominator, numerator / denominator]
  // and this.m parts are used accross whole program except for rendering the fraction itself in it input field
  public static populateMs(fractions, m) {
    let ix = 0;
    for (const fr in fractions) {
      if (fractions[fr]) {
        const fx = fractions[fr];
        if (fx.indexOf('/') < 0) {
          m[ix] = [fx, 0, eval(fx), 0];
        } else {
          const res = `${fx}`.match(/(.*)?\/(.*)$/);
          const fxv1 = eval(res[1]);
          const fxv2 = eval(res[2]);
          m[ix] = [fx, fxv1, fxv2, fxv1 / fxv2];
        }
        ix += 1;
      } else {
        ix += 1;
      }
    }
  }
  // get prime factors for a denominator
  public static toPrimeFactors(num: number): string {
    return Utils.primeFactors(num);
  }

  // set value on input box and fire onchange
  public static setValueAndFireOnChange(
    elementName: string,
    val: string | number
  ) {
    try {
      const el = Utils.EL(elementName);
      el.value = val;
      const evt = document.createEvent('HTMLEvents');
      evt.initEvent('change', true, false);
      el.dispatchEvent(evt);
    } catch (e) {
      console.log(`setValueAndFireOnChange ${e}`);
    }
  }

  public static click(elementName: string) {
    try {
      Utils.EL(elementName).click();
    } catch (err) {
      console.log(err);
    }
  }
  // get by id and return <any> type as compiler does not recognizes
  // the value property othrwise
  public static EL(id: string) {
    return document.getElementById(id) as any;
  }
  // returns the first element as <any>
  public static ELByClass(cname: string) {
    try {
      return document.getElementsByClassName(cname)[0] as any;
    } catch {
      return null;
    }
  }
}
