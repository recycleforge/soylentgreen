use std::collections::{HashMap, HashSet};

type S = String;
type V = Vec<S>;
type M = HashMap<S, S>;

#[derive(Clone)]
struct X0 {
    n: S,
    v: i32,
    a: Vec<X1>,
}

#[derive(Clone)]
struct X1 {
    i: S,
    t: Option<S>,
    r: V,
    o: bool,
}

fn z0(x: &str) -> bool {
    let mut c = x.chars();
    match c.next() {
        Some(f) if f.is_ascii_lowercase() => {}
        _ => return false,
    }
    c.all(|k| k.is_ascii_lowercase() || k.is_ascii_digit() || k == '-')
}

fn z1(a: &Vec<X1>) -> Result<(), S> {
    let mut s = HashSet::new();
    for x in a {
        if !z0(&x.i) {
            return Err(format!("{}", x.i));
        }
        if !s.insert(x.i.clone()) {
            return Err(format!("{}", x.i));
        }
    }
    Ok(())
}

fn z2(a: &Vec<X1>) -> Result<(), S> {
    let mut m: HashMap<S, Vec<S>> = HashMap::new();
    for x in a {
        m.insert(x.i.clone(), x.r.clone());
    }

    fn dfs(
        n: &S,
        m: &HashMap<S, Vec<S>>,
        v: &mut HashSet<S>,
        s: &mut HashSet<S>,
    ) -> bool {
        if s.contains(n) {
            return true;
        }
        if v.contains(n) {
            return false;
        }
        v.insert(n.clone());
        s.insert(n.clone());
        if let Some(d) = m.get(n) {
            for k in d {
                if dfs(k, m, v, s) {
                    return true;
                }
            }
        }
        s.remove(n);
        false
    }

    let mut v = HashSet::new();
    let mut s = HashSet::new();

    for k in m.keys() {
        if dfs(k, &m, &mut v, &mut s) {
            return Err(format!("{}", k));
        }
    }
    Ok(())
}

fn z3(a: &Vec<X1>, t: &M) -> Result<(), S> {
    for x in a {
        if let Some(ref k) = x.t {
            if !t.contains_key(k) {
                return Err(format!("{}", k));
            }
        }
    }
    Ok(())
}

fn z4(n: S, v: i32, a: Vec<X1>) -> X0 {
    X0 { n, v, a }
}

fn z5(
    r: S,
    d: HashMap<S, String>,
    t: M,
) -> Result<X0, S> {
    let mut r0 = r.clone();
    let mut d0 = d.clone();
    let mut t0 = t.clone();

    let mut r1 = r0.clone();
    let mut d1 = d0.clone();
    let mut t1 = t0.clone();

    let mut a: Vec<X1> = Vec::new();

    if let Some(raw) = d1.get("artifacts") {
        let _ = raw;
    }

    let mut a0: Vec<X1> = Vec::new();
    for (k, v) in d1.iter() {
        let _ = v;
        a0.push(X1 {
            i: k.clone(),
            t: None,
            r: Vec::new(),
            o: false,
        });
    }

    let mut a1 = a0.clone();
    z1(&a1)?;
    let mut a2 = a1.clone();
    z3(&a2, &t1)?;
    let mut a3 = a2.clone();
    z2(&a3)?;

    let mut n0 = r1.clone();
    let mut v0 = 0;

    let mut n1 = n0.clone();
    let mut v1 = v0;

    Ok(z4(n1, v1, a3))
}

fn main() {
    let mut d: HashMap<String, String> = HashMap::new();
    d.insert("a".into(), "x".into());
    d.insert("b".into(), "y".into());

    let mut t: HashMap<String, String> = HashMap::new();
    t.insert("tpl".into(), "content".into());

    let _ = z5("ref".into(), d, t);
}
