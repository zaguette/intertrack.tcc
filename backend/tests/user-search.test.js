import assert from "node:assert/strict";
import { test } from "node:test";
import { prisma } from "../src/config/prisma.js";
import { userController } from "../src/controllers/userController.js";

function response() {
    return {
        status(code) { this.statusCode = code; return this; },
        json(body) { this.body = body; return this; }
    };
}

function mockFindMany(t, implementation) {
    const original = prisma.usuario.findMany;
    const mock = t.mock.fn(implementation);
    prisma.usuario.findMany = mock;
    t.after(() => { prisma.usuario.findMany = original; });
    return mock;
}

test("busca consulta nomes alternativos ativos e retorna o titular", async (t) => {
    const titular = { id: "titular-id", nome: "João", ra: "123456" };
    let query;
    mockFindMany(t, async (args) => {
        query = args;
        return [titular];
    });
    const res = response();
    await userController.findAll({ query: { busca: "  Maria  " } }, res);
    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.body, [titular]);
    assert.deepEqual(query.where, {
        ativo: true,
        OR: [
            { nome: { contains: "Maria" } },
            { ra: { contains: "Maria" } },
            { nomesAlternativos: { some: {
                nome_completo: { contains: "Maria" }, ativo: true, tipo: "alternativo"
            } } }
        ]
    });
    assert.equal(query.select.id, true);
});

test("sem texto de busca preserva listagem completa", async (t) => {
    mockFindMany(t, async ({ where }) => {
        assert.deepEqual(where, {});
        return [];
    });
    for (const query of [{}, { busca: "   " }]) {
        const res = response();
        await userController.findAll({ query }, res);
        assert.equal(res.statusCode, 200);
        assert.deepEqual(res.body, []);
    }
});

test("rejeita busca estruturada ou repetida antes de consultar o banco", async (t) => {
    const mock = mockFindMany(t, async () => []);
    for (const busca of [["Maria", "Ana"], { nome: "Maria" }]) {
        const res = response();
        await userController.findAll({ query: { busca } }, res);
        assert.equal(res.statusCode, 400);
    }
    assert.equal(mock.mock.callCount(), 0);
});
