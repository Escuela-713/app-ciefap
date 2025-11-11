try:
    import pymysql
    pymysql.install_as_MySQLdb()
except Exception:
    # PyMySQL no instalado; si se usa SQLite o MySQL con mysqlclient, esto no es necesario.
    pass