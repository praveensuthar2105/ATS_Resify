public class CheckOldDB {
    public static void main(String[] args) {
        try (java.sql.Connection c = java.sql.DriverManager.getConnection("jdbc:mysql://34.100.250.145:3306/resume_builder?useSSL=false", "root", "1Praveensuthar");
             java.sql.Statement s = c.createStatement();
             java.sql.ResultSet rs = s.executeQuery("SELECT COUNT(*) FROM users")) {
            if (rs.next()) {
                System.out.println("Users count in OLD resume_builder: " + rs.getInt(1));
            }
        } catch(Exception e) {
            e.printStackTrace();
        }
    }
}
