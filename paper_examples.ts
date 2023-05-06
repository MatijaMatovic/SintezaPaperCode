function curry(func: Function) {
    return function curried(...args: any[]) {
        if (args.length >= func.length) 
            return func.apply(null, args);
        else {
            return function(...args2: any[]) {
                return curried.apply(null, args.concat(args2));
            }
        }
  };
}

function prt(a: any) {
    console.log(Object.getOwnPropertyNames(a))
}

interface X {
    a: number,
    b: string
}

interface Y {
    b: number,
    c: number
}

let x: X = {a: 1, b: 'b'}
let y: Y = {b: 1, c: 2}

function example(a: number, b:number, c: X): number {
    return a * b * c.a;
}

console.log(curry(example)(1)(2)(x))  // Works
console.log(example(1, 2, x))  // Works
console.log(curry(example)(1)(2)(y))  // Works - It shouldn't, example function only receives numbers
console.log(example(1, 2, y))  // IDE displays an error message  



abstract class Maybe<T> {

    abstract mmap<X>(f: (x: T) => X): Maybe<X>

}

class Just<T> extends Maybe<T> {
    value: T;

    constructor(value: T) {
        super();
        this.value = value;
    }

    mmap<X>(f: (x: T) => X) {
        return new Just<X>(f(this.value));
    }

}

class Nothing<T> extends Maybe<T> {
    mmap<X>(f: (x: T) => X) {
        return new Nothing<X>
    }
}

function inc(x: number): number {
    return x + 1
}





let maybe1 = new Just(5)
let maybe2 = new Nothing<number>()

let result1 = maybe1.mmap(inc).mmap(inc)
let result2 = maybe2.mmap(inc).mmap(inc)

console.log(result1)
console.log(result2)

function listLookup(list: Array<number>, x: number): Maybe<number> {
    for (let i = 0; i < list.length; i++) {
        if (list[i] == x)
            return new Just(i)
    }
    return new Nothing<number>;
}

function isNothing<T>(x: Maybe<T>): x is Nothing<T> {
    return (x as Just<T>).value === undefined;
}

function maybeMap<T, U>(f: (x: T) => U, m: Maybe<T>): Maybe<U> {
    f = curry(f);
    if (m instanceof Just) {
        let {value} = m;
        return new Just(f(value));
    }
    return new Nothing<U>();
}

function maybePure<T>(x: T): Maybe<T> {
    return new Just(x);
}

function maybeSuperMap<T, U>(f: Maybe<(x: T) => U>, m: Maybe<T>): Maybe<U> {
    if (f instanceof Just) {
        let {value: func} = f;
        return maybeMap(func, m);
    }
    return new Nothing<U>();
}

console.log(maybeMap(inc, maybe1))
console.log(maybeMap(inc, maybe2))
console.log(maybeMap(inc, maybeMap(inc, maybe1)))
console.log(maybeMap(inc, maybeMap(inc, maybe2)))

let list1 = [1, 2, 3, 4, 5]
let lookupResult1 = listLookup(list1, 3).mmap(inc).mmap(inc)
let lookupResult2 = listLookup(list1, 6).mmap(inc).mmap(inc)

console.log(lookupResult1)
console.log(lookupResult2)

// More functional-programmy way
lookupResult1 = maybeMap(inc, maybeMap(inc, listLookup(list1, 3)))
lookupResult2 = maybeMap(inc, maybeMap(inc, listLookup(list1, 6)))

console.log(lookupResult1)
console.log(lookupResult2)


abstract class List<T> {

}

class Empty<T> extends List<T> {

}

class Cons<T> extends List<T> {
    head: T;
    tail: List<T>;

    constructor(value: T, tail: List<T>) {
        super();
        this.head = value;
        this.tail = tail;
    }
}

let l = new Cons(5, new Cons(4, new Cons(3, new Cons(2, new Cons(1, Empty<number>)))));
let l2 = new Cons(15, new Cons(14, new Cons(13, new Cons(12, new Cons(11, Empty<number>)))));
let l3 = new Cons(25, new Cons(24, new Cons(23, new Cons(22, new Cons(21, Empty<number>)))));
let ll = new Cons(l3, new Cons(l2, new Cons(l, new Empty<List<Number>>)));



function listMap<T, U>(f: (x: T) => U, l: List<T>): List<U> {
    f = curry(f);
    if (l instanceof Cons) {
        let {head, tail} = l;
        return new Cons(f(head), listMap(f, tail));
    }
    return new Empty<U>();
}

function fold<T>(product: (l: T, r: T) => T, accumulator: T, xs: List<T>): T {
    if (xs instanceof Cons<T>) {
        let {head, tail} = xs;
        return product(head, fold(product, accumulator, tail));
    }
    return accumulator;
}

function listAdd<T>(x: T, l: List<T>): List<T> {
    return new Cons(x, l);
}

function join<T>(l1: List<T>, l2: List<T>): List<T> {
    if (l1 instanceof Cons) {
        let {head, tail} = l1;
        return listAdd(head, join(tail, l2))
    }
    return l2;
}

function concat<T>(l: List<List<T>>): List<T> {
    return fold(join, new Empty<T>(), l);
}

function listConcatMap<T>(f: (x: T) => List<T>, l: List<T>): List<T> {
    return concat(listMap(f, l));
}

function listPure<T>(x: T): List<T> {
    return new Cons(x, Empty<T>);
}

function listSuperMap<T, U>(fs: List<(x: T) => U>, xs: List<T>): List<U> {
    fs = listMap(curry, fs);
    return listConcatMap(f => listMap(x => f(x), xs), fs);
}

let listMapResult = listMap(inc, l);
console.log(listMapResult)

let listAddResult = listAdd(6, l);
console.log(listAddResult)


/* APPLICATIVE FUNCTORS */
/* ==================== */

function threeNumbers(a: number, b: number, c: number): number {
    return a * b + c**2;
}

let n1 = new Just(3);
let n2 = new Just(4);
let n3 = new Just(2);

/* Ovde se buni: Type '(a: number, b: number, c: number) => number' is not assignable to type '(x: number) => number' */
let supermap1 = maybeSuperMap(maybePure(threeNumbers), n1);  
/* Ovde i dole se buni: Type 'number' is not assignable to type '(x: number) => unknown'. */
let supermap2 = maybeSuperMap(supermap1, n2);  
let supermap3 = maybeSuperMap(supermap2, n3);  // Medjutim kod dobro radi i vraca Just: { "value": 16 } kako i treba
console.log(supermap3)

function expand(a: number) {
    return new Cons(a-1, new Cons(a, new Cons(a+1, new Empty<number>())));
}

console.log(concat(ll));
console.log(join(l2, l3));
console.log(listConcatMap(expand, l));

function combine<T>(a: T, b: T) {
    return new Cons(a, new Cons(b, new Empty<T>()));
}

let l_left = new Cons(1, new Cons(2, new Empty<number>()));
let l_right = new Cons(11, new Cons(12, new Empty<number>()));

let _cartesian = listSuperMap(listPure(combine), l_left);
let cartesian = listSuperMap(_cartesian, l_right)
console.log(cartesian) 

