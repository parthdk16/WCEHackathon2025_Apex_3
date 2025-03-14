from .connect import get_connection

class WeatherCRUD:
    def __init__(self):
        self.drop_table()
        self.create_table()

    def drop_table(self):
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("DROP TABLE IF EXISTS weather_data")
                conn.commit()
                
    def create_table(self):
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS weather_data (
                        id SERIAL,
                        recorded_at TIMESTAMPTZ NOT NULL,
                        meantemp FLOAT NOT NULL,
                        humidity FLOAT NOT NULL,
                        wind_speed FLOAT NOT NULL,
                        meanpressure FLOAT NOT NULL,
                        PRIMARY KEY (id, recorded_at)  -- Composite key
                    );
                    SELECT create_hypertable('weather_data', 'recorded_at', if_not_exists => TRUE);
                """)
                conn.commit()

    def insert_data(self, temp, humidity, wind_speed, pressure):
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO weather_data 
                    (recorded_at, meantemp, humidity, wind_speed, meanpressure)
                    VALUES (NOW(), %s, %s, %s, %s)
                """, (temp, humidity, wind_speed, pressure))
                conn.commit()

    def get_recent(self, limit=10):
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT * FROM weather_data 
                    ORDER BY recorded_at DESC 
                    LIMIT %s
                """, (limit,))
                return cur.fetchall()

    def update_data(self, record_id, temp=None, humidity=None):
        updates = []
        params = []
        if temp is not None:
            updates.append("meantemp = %s")
            params.append(temp)
        if humidity is not None:
            updates.append("humidity = %s")
            params.append(humidity)
        
        params.append(record_id)
        
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(f"""
                    UPDATE weather_data
                    SET {", ".join(updates)}
                    WHERE id = %s
                """, params)
                conn.commit()

    def delete_old_data(self, days=30):
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    DELETE FROM weather_data 
                    WHERE recorded_at < NOW() - INTERVAL '%s days'
                """, (days,))
                conn.commit()