package com.test.myapplication.api;

import com.test.myapplication.models.appointments.Appointment;
import com.test.myapplication.models.appointments.BookAppointment;
import com.test.myapplication.models.login.Login;
import com.test.myapplication.models.predictions.Predictions;
import com.test.myapplication.models.user.User;

import java.util.ArrayList;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.POST;
import retrofit2.http.Path;
import retrofit2.http.Query;

/**
 * Created by NehaRege on 10/25/17.
 */
public interface ApiService {

    /**
     * https://remote-health-api.herokuapp.com/api/users/neharege28@gmail.com
     *
     * @param emailId
     * @return
     */

    @GET("/api/users/{emailId}")
    Call<User> getUser(@Path("emailId") String emailId);

    /**
     * https://remote-health-api.herokuapp.com/api/appointments/patient/neharege28@gmail.com
     *
     * @param emailId
     * @return
     */

    @GET("/api/appointments/patient/{emailId}")
    Call<ArrayList<Appointment>> getAppointments(@Path("emailId") String emailId);

    /**
     * https://remote-health-api.herokuapp.com/api/appointments
     *
     * @param newAppointment
     * @return
     */

    @POST("/api/appointments")
    Call<BookAppointment> createNewAppointment(@Body BookAppointment newAppointment);

    /**
     * https://remote-health-api.herokuapp.com/api/prediction?symptoms=weight%20loss,tired&email=jesantos0527@gmail.com
     *
     * @param symptoms
     * @param email
     * @return
     */

    @GET("/api/prediction")
    Call<Predictions> getPredictions(
            @Query("symptoms") String symptoms,
            @Query("email") String email
    );

    /**
     * https://remote-health-api.herokuapp.com/api/users/{USER_EMAIL}/{PASSWORD}/login
     * https://remote-health-api.herokuapp.com/api/users/jesantos0527-test@gmail.com/Testing1/login
     *
     * @param USER_EMAIL
     * @param PASSWORD
     * @return
     */

    @GET("/api/users/{USER_EMAIL}/{PASSWORD}/login")
    Call<Login> checkLoginCredentials(
            @Path("USER_EMAIL") String USER_EMAIL,
            @Path("PASSWORD") String PASSWORD
    );

}
