public class CheckDB {
    public static void main(String[] args) {
        try (java.sql.Connection c = java.sql.DriverManager.getConnection("jdbc:mysql://34.93.197.175:3306/resume_builder?useSSL=false", "root", "1Praveen@");
             java.sql.Statement s = c.createStatement();
             java.sql.ResultSet rs = s.executeQuery("SELECT COUNT(*) FROM users")) {
            if (rs.next()) {
                System.out.println("Users count in resume_builder: " + rs.getInt(1));
            }
        } catch(Exception e) {
            e.printStackTrace();
        }
        
        try (java.sql.Connection c = java.sql.DriverManager.getConnection("jdbc:mysql://34.93.197.175:3306/?useSSL=false", "root", "1Praveen@");
             java.sql.ResultSet rs = c.getMetaData().getCatalogs()) {
            System.out.print("Available databases: ");
            while (rs.next()) {
                System.out.print(rs.getString(1) + ", ");
            }
            System.out.println();
        } catch(Exception e) {
            e.printStackTrace();
        }
    }
}
