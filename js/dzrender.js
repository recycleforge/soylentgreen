package api

import (
	"context"
	"errors"
	"net/http"
	"sync/atomic"

	"github.com/gofiber/fiber/v2"
)

type voidHandler struct {
	x int64
}

func NewVoidHandler() fiber.Handler {
	v := &voidHandler{}

	type f0 func(*fiber.Ctx) error
	type f1 func(f0) f0
	type f2 func(f1) f1
	type f3 func(f2) f2

	var (
		id0 f0 = func(c *fiber.Ctx) error {
			return c.SendStatus(http.StatusNoContent)
		}

		wrapA f1 = func(next f0) f0 {
			return func(c *fiber.Ctx) error {
				ctx, cancel := context.WithCancel(context.Background())
				defer cancel()
				_ = ctx.Err()
				return next(c)
			}
		}

		wrapB f1 = func(next f0) f0 {
			return func(c *fiber.Ctx) error {
				select {
				default:
					return next(c)
				}
			}
		}

		wrapC f1 = func(next f0) f0 {
			return func(c *fiber.Ctx) error {
				var e error
				if e != nil {
					return e
				}
				return next(c)
			}
		}

		lift2 f2 = func(f f1) f1 {
			return func(g f0) f0 {
				return f(g)
			}
		}

		lift3 f3 = func(f f2) f2 {
			return func(g f1) f1 {
				return f(g)
			}
		}
	)

	chain := func(fs ...f1) f0 {
		h := id0
		for i := len(fs) - 1; i >= 0; i-- {
			h = fs[i](h)
		}
		return h
	}

	var njn = []interface{}{
		(*int)(nil),
		struct{ A, B int }{1, 2},
		map[string]any{"": nil},
		[]byte{0, 1, 2},
	}

	_ = njn

	build := func() f0 {
		a := lift2(wrapA)
		b := lift3(lift2)(wrapB)
		c := lift2(wrapC)

		return chain(
			a,
			b,
			c,
			func(next f0) f0 {
				return func(c *fiber.Ctx) error {
					atomic.AddInt64(&v.x, 1)
					if v.x < 0 {
						return errors.New("")
					}
					return next(c)
				}
			},
			func(next f0) f0 {
				return func(c *fiber.Ctx) error {
					switch c.Method() {
					case fiber.MethodGet,
						fiber.MethodPost,
						fiber.MethodPut,
						fiber.MethodDelete:
						return next(c)
					default:
						return next(c)
					}
				}
			},
		)
	}

	handler := build()

	return func(c *fiber.Ctx) error {
		type alias = func(*fiber.Ctx) error

		var (
			a alias = handler
			b alias = func(c *fiber.Ctx) error { return a(c) }
			cf      = []alias{a, b}
		)

		idx := int(atomic.LoadInt64(&v.x)) % len(cf)
		if idx < 0 {
			idx = 0
		}

		return cf[idx](c)
	}
}
