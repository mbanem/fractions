import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Fraction, Utils } from './cpmmon/utils';
import { StoryTeller } from './cpmmon/explanation';

let renderTime = null;
const EPSILON = 6e-16;
const PLEASE_CORRECT = 'Incorrect value entered, Please correct.';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {
  // using this.message = 'something', instead of this.message('something')
  set message(msg) {
    this.msgbox.innerText = msg;
  }


  // fractions f0..f3 get data via fractionInputOnChange (change) handler only to be transformed
  // into this.m[0--3] in format ["f0..f3", numerator, denominator, numerator / denominator]
  // which are then used throught the program
  // f4 should be f.1 + f2 as a correct result, i.e. m[1][3]+m[2][3] = m[4][3]
  fractions: object = {
    f0: '',
    f1: '',
    f2: '',
    f3: '',
    f4: ''
  };
  // tooltips for fractions column in rows 0--4
  ttix = [0, 1, 1, 0, 0];
  // this will take from fractions above and create more detailed parts
  m = [null, null, null, null, null, null];
  wholeWidth = null;
  msgbox = null;

  // colors for left parts of rows with id="whole0..4" coloring rectangles
  color = ['#fcfc73', '#fcfc73', '#c6c6f8', '#c6c6f8', '#fcfc73'];

  setTooltip(ix: number, str: string = null) {
    const ttEl = Utils.EL(
      `tooltip${ix}`
    );
    if (str) {
      ttEl.innerHTML = str;
      return;
    }
    let s = '';
    const el = Utils.EL(`tooltip${ix}`);
    if ([1, 2, 4].includes(ix)) {
      const m1 = this.m[ix][1];
      const m2 = this.m[ix][2];
      s =
        m1 < m2
          ? Fraction.fraction(m1, m2).result
          : Fraction.isProper(m1, m2).result;
    } else if ([0, 3].includes(ix)) {
      const lcd = Utils.lcd(this.m[1][2], this.m[2][2]);
      if (
        (ix === 0 && this.m[0] && this.m[1][2] !== lcd) ||
        (ix === 3 && this.m[3] && this.m[2][2] !== lcd)
      ) {
        const c = ix === 0 ? lcd / this.m[1][2] : lcd / this.m[2][2];
        s = `expanded fraction by ${c}`;
        el.classList.remove('hide-tooltip');
      } else {
        el.classList.add('hide-tooltip');
      }
    }
    ttEl.innerHTML = `<span class="tt tt - text1">${s}</span>`;
  }
  setLCDTooltips() {
    const lcd = Utils.lcd(this.m[1][2], this.m[2][2]);
    for (let ix = 1; ix <= 2; ix++) {
      const txt =
        lcd === this.m[ix][2]
          ? 'it is already equal to LCD'
          : `Needs factor ${lcd / this.m[ix][2]} for LCD`;
      Utils.EL(
        `tooltipLCD${ix}`
      ).innerHTML = `<span class="tt tt - text1">${txt}</span>`;
    }
  }
  canExpand() {
    const m = this.m;
    const result = m[1] && m[2] && m[1][2] !== m[2][2];
    return result;
  }
  expandFractions() {
    const lcd = Utils.lcd(this.m[1][2], this.m[2][2]);
    const c1 = lcd / this.m[1][2];
    const c2 = lcd / this.m[2][2];
    const el0 = Utils.EL(`frac0`);
    const el3 = Utils.EL(`frac3`);

    if (el0.value && el3.value) {
      [el0, el3].forEach(el => {
        const nd = el.value.split('/');    // nd: numerator-denominator
        this.m[el === el0 ? 0 : 3] = [el.value, eval(nd[0]), eval(nd[1])];
      });
    }

    if (c1 > 1) {
      this.setTooltip(0);
    }
    if (c2 > 0) {
      this.setTooltip(3);
    }
    // el0.focus();
    const m1 = this.m[1];
    el0.value =
      c1 === 1 ? this.m[1][0] : `${m1[1]}*${c1} / ` + `${m1[2]}*${c1}`;
    if (el0.value) {
      this.renderRectangles(0);
    }
    // el0.value = (c1 === 1) ? Fraction.fraction(m1[1], m1[2]).result
    //   : Fraction.fraction(`${m1[1]}*${c1}`, `${m1[2]}*${c1}`).result;
    // el0.blur();

    // el3.focus();
    const m2 = this.m[2];
    el3.value =
      c2 === 1 ? this.m[2][0] : `${m2[1]}*${c2} / ` + `${m2[2]}*${c2}`;
    if (el3.value) {
      this.renderRectangles(3);
    }
    // el3.value = (c2 === 1) ? Fraction.fraction(m2[1], m2[2]).result
    //   : Fraction.fraction(`${m2[1]}*${c2}`, `${m2[2]}*${c2}`).result;
    // el3.blur();

    try {
      Utils.EL('tdExpand0').innerHTML = Fraction.fraction(
        this.m[1][1] * c1,
        this.m[1][2] * c1
      ).result;
      Utils.EL('tdExpand3').innerHTML = Fraction.fraction(
        this.m[2][1] * c2,
        this.m[2][2] * c2
      ).result;
    } catch (e) {
      console.log(`render expanded: ${e}`);
    }
    // if (Utils.EL("chkAutomatic").checked) {
    //   Utils.EL("frac4").focus();
    // }
  }
  // Angular *ngFor does not support dynamic name.id like id=`{{'frac'+ ix}}
  // or backticks, so this 'onchange' binding feeds the above fracions{f0:'',f1:'',...,f4:''}
  fractionInputOnChange(event: any) {
    try {
      const ix = event.target.id.match(/^.*(\d)/)[1];
      const fx = event.target.value;
      this.fractions[`f${ix}`] = fx;
      if (fx.indexOf('/') < 0) {
        this.m[ix] = ['0/' + fx, 0, eval(fx), 0];
      } else {
        const res = fx.match(/^([^/]*)\/(.+)/);
        if (res && res[1] && res[2]) {
          const fxv1 = eval(res[1]);
          const fxv2 = eval(res[2]);
          this.m[ix] = [fx, fxv1, fxv2, fxv1 / fxv2];
          this.message = '';
        } else {
          return (this.message = PLEASE_CORRECT);
        }
      }

      if (!this.m[ix][2]) {
        return (this.message = PLEASE_CORRECT);
      }

      const m1 = this.m[ix][1];
      const m2 = this.m[ix][2];

      // put denominator into number1 or number2 for finding LCD at the bottom of the page
      if (+ix === 1 || +ix === 2) {
        Utils.setValueAndFireOnChange(`number${ix}`, this.m[ix][2]);
      }
      Utils.ELByClass(`equivalents${ix}`).innerText = Utils.toPrimeFactors(m2);
      this.render();

      if (Utils.EL('chkAutomatic').checked) {
        // move focus to appropriate input field
        const toEl = [null, 'frac2', 'frac4', null, 'frac1'];
        // Utils.EL(toEl[ix]).focus();
      }
      // if row1 and row2 have fractions then we can expand
      if (this.m[1] && this.m[2]) {
        this.expandFractions();
        this.setLCDTooltips();
      }
      this.expandFractions();
      // [0, 3].forEach(i => {
      //   const el = Utils.EL(`frac${i}`);
      //   if (el.value) {
      //     this.renderRectangles(i);
      //   }
      // });
    } catch (e) {
      console.log(`fractionInputOnChange: ${e}`);
    }
  }

  ngOnInit() {
    this.msgbox = Utils.EL('messagebox');
  }

  // whole0,..whole4 are dynamically created via *ngFor and so could be
  // addressed only after initialization, as it is too early in the ngOnInit
  ngAfterViewInit() {
    [0, 1, 2, 3, 4].forEach(ix => {
      Utils.EL(`tooltip${ix}`).classList.add('hide-tooltip');
    });
    this.wholeWidth = Utils.EL('whole1').offsetWidth;
    Utils.EL('explanation').innerHTML = StoryTeller.explain();
    // this.msgbox.innerHTML = Fraction.isProper(26, 14).result;
    Utils.EL(
      `tooltipW`
    ).innerHTML = `<span class="tt tt - text1">The whole part of an improper fraction</span>`;
  }

  // toggle Mia and Marko
  toggleStudentName(el: any) {
    Utils.toggleName(el);
  }

  // This will splits the whole line into n equal rectangles, where n is number if a whole number is
  // entered in frac1..frac4 input fields, or a denominator if a fraction is entered instead.
  // The numerator parts in 0th and 3rd lines are colored yellow, while 1st, 2nd and 4th in blue
  renderRectangles(ix: number) {
    try {
      let s = '';
      let m1 = this.m[ix][1];
      const m2 = this.m[ix][2];
      if (m1 > m2) {
        if (ix > 0 && ix !== 3) {
          Utils.EL(`unit${ix}`).innerHTML = Math.floor(m1 / m2);
          m1 = m1 % m2;
        }
      }
      const wdth = Math.round(this.wholeWidth * 1000 / m2) / 1000 - 1;

      let frac = '';
      // let  label = '';
      let color = this.color[ix];
      const fracVal = Fraction.fraction(1, m2).result;
      // render retangles with fraction in the rectangle cented of type 1/denominator
      for (let j = 1; j <= m2; j++) {
        if (j <= m1) {
          if (ix === 4 && this.m[1] && j > this.m[1][1] * m2 / this.m[1][2]) {
            // for sum f1 + f2 the color for f1 is this.color[1] and for f2 this.color[2]
            color = this.color[2];
          }
          // rectangles representing numerator or for total representing sum
          frac = `<div  style="width:${wdth}px;height:30px;border-right:1px solid black;
            background-color:${color};display:inline-block;text-align:center;`;
        } else {
          // rectangles representing resto of the whole: denominator - numerator
          frac = `<div style="width:${wdth}px;height:30px;border-right:1px solid black;
            background-color:transparent;display:inline-block;text-align:center;`;
        }

        s += frac + `">${fracVal}</div>`;
      }
      // divide the whole - the left part of row into rectangles
      if (ix === 4) {
        console.log(s);
      }
      Utils.EL(`whole${ix}`).innerHTML = s;
    } catch (e) {
      console.log(`renderRectangles: ${e}`);
    }
  }

  // werifies that there is an entry in frac0..4 input boxes and calls rendering
  // for those having a number=denominator or a fractin
  render() {
    try {
      console.log('render');
      this.message = '';
      Utils.populateMs(this.fractions, this.m); // may be this is not necessary if earlies events already did it?

      for (let ix = 0; ix < 5; ix++) {
        // if denominator this.m[ix]2]does not exist continue
        if (!this.m[ix] || !this.m[ix][2]) {
          continue; // skip rendering for an empty input box
        }
        // if (this.m[ix][3] > 1) {
        //   this.message =
        //     "To make it easy, consider only numerator values up tp the denominator values";
        //   return;
        // }
        // render rectangles for entered number=denominator ot a fraction numerator/denominator
        this.setTooltip(ix);
        if (this.incorrectSum()) {
          Utils.EL('whole4').innerHTML = '';
        } else {
          this.renderRectangles(ix);
        }
      }
      // set LCD if both fractions are specified in 2nd and 3rd lines
      const m = this.m;
      if (m[1] && m[2] && m[1][2] && m[2][2]) {
        const m1 = this.m[1][2];
        const m2 = this.m[2][2];
        const lcd = Utils.lcd(m1, m2);
        const prime1 = Utils.primeFactors(m1);
        const prime2 = Utils.primeFactors(m2);
        const pr1 = m1 === prime1 ? '' : ` = ${prime1}`;
        const pr2 = m2 === prime2 ? '' : ` = ${prime2}`;
        const primes = Utils.primeFactors(lcd);
        this.message = `LCD for ${m1}${pr1} and ${m2}${pr2} is ${lcd}, in primes ${primes}`;
      }
    } catch (e) {
      console.log(`render: ${e}`);
    }
  }

  // renders at the last row the expression showing all steps of adding
  // two fractions, called by renderResult, which is activated by the
  // user entering the sum and pressing enter or on the blur event
  resultExpression() {
    try {
      this.setTooltip(4);
      const expression = Utils.expressionForSum(this.fractions);
      // console.log(expression);
      Utils.ELByClass('equivalents4').innerHTML = expression;
      // were used with spinner that is discarded
      // this.toLowestCommonDenominator(+expression[1]);
    } catch (e) {
      console.log(`resultExpression: ${e}`);
    }
  }

  // activated when the sum is entered in the last row frac4 input field and user presses enter
  // key or on blur event
  renderResult() {
    if (renderTime === null) {
      renderTime = Date.now();
    } else if (Date.now() - renderTime < 1000) {
      renderTime = null;
      return;
    }
    try {
      Utils.populateMs(this.fractions, this.m);
      if (!this.m[4]) {
        return;
      }
      Utils.click('expand1');
      if (Math.abs(this.m[1][3] + this.m[2][3] - this.m[4][3]) > EPSILON) {
        Utils.ELByClass('equivalents4').innerText = '';
        const m = this.m;
        Utils.EL('messagebox').innerHTML = Fraction.operand(
          'Please notice that sum '
        )
          .fraction(m[1][1], m[1][2])
          .operand('+')
          .fraction(m[2][1], m[2][2])
          .operand(' is not equal to')
          .fraction(m[4][1], m[4][2]).result;
        Utils.EL('whole4').innerHTML = '';
        this.setTooltip(4, 'incorect');
        return;
      }
      // this.render();
      this.renderRectangles(4);
      this.resultExpression();
    } catch (e) {
      console.log(`renderResult: ${e}`);
    }
  }

  // triggered by spinner by user or by renderResult function
  // which is activated when sum result is entered and user press enter
  // or on blur event
  // expandFractionBySpinerNumber(event: any) {
  //   let ix = event.target.id.match(/^.*(\d+)$/)[1]
  //   this.expandFraction(+ix, event.target.value);
  // }

  factorize(event: any, toid: string) {
    try {
      Utils.EL(toid).value = Utils.primeFactors(event.target.value);
      const n1 = +Utils.EL('number1').value;
      const n2 = +Utils.EL('number2').value;
      if (n1 && n2) {
        const lcd = Utils.lcd(n1, n2);
        Utils.EL('lcd3').value = lcd + ' = ' + Utils.primeFactors(lcd);
      }
    } catch (e) {
      console.log(`factorize${e}`);
    }
  }

  incorrectSum() {
    try {
      const m = this.m;
      if (m[1] && m[2] && m[4]) {
        return Math.abs(m[1][3] + m[2][3] - m[4][3]) > EPSILON;
      }
      return false;
    } catch (e) {
      console.log(`incorrectSum: ${e}`);
    }
  }
  clearResultRow() {
    // console.log("clearResultRow");
    Utils.EL('whole4').innerHTML = '';
    Utils.EL('frac4').innerHTML = '';
    Utils.ELByClass('equivalents4').innerHTML = '';
  }
}
