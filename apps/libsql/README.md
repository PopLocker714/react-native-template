
## create jwt sicret
```
SECRET_HEX=$(bun -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
echo "SECRET_HEX=$SECRET_HEX"   # сохраните – он нужен и серверу и клиенту

printf "$SECRET_HEX" | xxd -r -p > jwt.key
```


## create namespace

```bash
curl -X POST http://localhost:7017/v1/namespaces/myapp/create \
  -H "Content-Type: application/json" \
  -d '{}'
```
