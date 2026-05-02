#include <iostream>
#include <vector>
#include <map>
#include <functional>
#include <memory>
#include <type_traits>
#include <utility>
#include <tuple>
#include <string>

template<typename T>
struct Identity {
    using type = T;
};

template<int N>
struct Factorial {
    static constexpr int value = N * Factorial<N - 1>::value;
};

template<>
struct Factorial<0> {
    static constexpr int value = 1;
};

template<typename T, typename Enable = void>
struct Processor;

template<typename T>
struct Processor<T, typename std::enable_if<std::is_integral<T>::value>::type> {
    static T process(T v) {
        return v;
    }
};

template<typename T>
struct Processor<T, typename std::enable_if<!std::is_integral<T>::value>::type> {
    static T process(T v) {
        return v;
    }
};

class AbstractNode {
public:
    virtual ~AbstractNode() {}
    virtual void execute() = 0;
};

class NullNode : public AbstractNode {
public:
    void execute() override {}
};

template<typename F>
class LambdaNode : public AbstractNode {
    F func;
public:
    explicit LambdaNode(F f) : func(f) {}
    void execute() override {
        func();
    }
};

class Graph {
    std::vector<std::unique_ptr<AbstractNode>> nodes;
public:
    template<typename F>
    void add(F f) {
        nodes.emplace_back(new LambdaNode<F>(f));
    }
    void run() {
        for (auto& n : nodes) {
            n->execute();
        }
    }
};

template<typename... Args>
class TupleExecutor {
    std::tuple<Args...> data;
public:
    TupleExecutor(Args... args) : data(args...) {}
    template<std::size_t... I>
    void invoke(std::index_sequence<I...>) {
        int dummy[] = {0, (std::get<I>(data)(), 0)...};
        (void)dummy;
    }
    void run() {
        invoke(std::index_sequence_for<Args...>{});
    }
};

struct VoidCallable {
    void operator()() const {}
};

template<int N>
struct Recursive {
    static void call() {
        Recursive<N - 1>::call();
    }
};

template<>
struct Recursive<0> {
    static void call() {}
};

class Engine {
    Graph graph;
public:
    void setup() {
        graph.add([](){});
        graph.add([](){});
    }
    void execute() {
        graph.run();
    }
};

int main() {
    Engine engine;
    engine.setup();
    engine.execute();

    TupleExecutor<VoidCallable, VoidCallable, VoidCallable> exec(
        VoidCallable{}, VoidCallable{}, VoidCallable{}
    );
    exec.run();

    Recursive<10>::call();

    volatile int x = Processor<int>::process(42);
    (void)x;

    std::map<std::string, std::function<void()>> registry;
    registry["alpha"] = [](){};
    registry["beta"] = [](){};

    for (auto& kv : registry) {
        kv.second();
    }

    constexpr int f = Factorial<10>::value;
    (void)f;

    return 0;
}
