/*
 * (C) Copyright 2014 Kurento (http://kurento.org/)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

package org.kurento.orion;

import static org.apache.http.entity.ContentType.APPLICATION_JSON;
import static org.kurento.orion.entities.ContextUpdate.ContextUpdateAction.APPEND;
import static org.kurento.orion.entities.ContextUpdate.ContextUpdateAction.DELETE;
import static org.kurento.orion.entities.ContextUpdate.ContextUpdateAction.UPDATE;

import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.Reader;
import java.net.URI;
import java.net.URISyntaxException;

import javax.annotation.PostConstruct;

import org.apache.http.HttpResponse;
import org.apache.http.HttpStatus;
import org.apache.http.client.fluent.Request;
import org.apache.http.client.fluent.Response;
import org.apache.http.client.utils.URIBuilder;
import org.kurento.orion.entities.ContextUpdate;
import org.kurento.orion.entities.ContextUpdateResponse;
import org.kurento.orion.entities.OrionAttribute;
import org.kurento.orion.entities.OrionContextElement;
import org.kurento.orion.entities.QueryContext;
import org.kurento.orion.entities.QueryContextResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;

import com.google.gson.Gson;

/**
 * Connector to the ORion context broker. This connector uses only the NGSI10 service from Orion,
 * and none of it's convenience methods.
 *
 * @author Ivan Gracia (izanmail@gmail.com)
 *
 */
public class OrionConnector {

  private static final String QUERY_PATH = "/ngsi10/queryContext";
  private static final String UPDATE_PATH = "/ngsi10/updateContext";
  private static final String SUBSCRIBE_PATH = "/ngsi10/subscribeContext";
  private static final String ENTITIES_PATH = "/ngsi10/contextEntities";
  private static final String UNSUBSCRIBE_PATH = "/ngsi10/unsubscribeContext";
  private static final String UPDATE_SUBSCRIBE_PATH = "/ngsi10/updateContextSubscription";

  private static final Gson gson = new Gson();
  private static final Logger log = LoggerFactory.getLogger(OrionConnector.class);

  @Autowired
  private OrionConnectorConfiguration config;

  private URI orionAddr;

  /**
   * Default constructor to be used when the orion connector is created from a spring context.
   */
  public OrionConnector() {

  }

  /**
   * Orion connector constructor. This constructor is to be used when the connector is used outside
   * from a spring context.
   *
   * @param config
   *          Configuration object
   */
  public OrionConnector(OrionConnectorConfiguration config) {
    this.config = config;
    this.init();
  }

  /**
   * Initiates the {@link #orionAddr}. This step is performed to validate the fields from the
   * configuration object.
   */
  @PostConstruct
  private void init() {
    try {
      this.orionAddr = new URIBuilder().setScheme(this.config.getOrionScheme())
          .setHost(this.config.getOrionHost()).setPort(this.config.getOrionPort()).build();
    } catch (URISyntaxException e) {
      throw new OrionConnectorException("Could not build URI to make a request to Orion", e);
    }
  }

  /**
   * Register context elements in the Orion context broker.
   *
   * @param events
   *          List of events
   * @return The response from the context broker.
   * @throws OrionConnectorException
   *           if a communication exception happens, either when contacting the context broker at
   *           the given address, or obtaining the answer from it.
   *
   */
  public ContextUpdateResponse registerContextElements(OrionContextElement... events) {
    ContextUpdate ctxUpdate = new ContextUpdate(APPEND, events);
    return sendRequestToOrion(ctxUpdate, UPDATE_PATH, ContextUpdateResponse.class);
  }

  /**
   * Updates context elements that exist in Orion.
   *
   * @param events
   *          events
   * @return The response from the context broker.
   * @throws OrionConnectorException
   *           if a communication exception happens, either when contacting the context broker at
   *           the given address, or obtaining the answer from it.
   */
  public ContextUpdateResponse updateContextElements(OrionContextElement... events) {
    ContextUpdate ctxUpdate = new ContextUpdate(UPDATE, events);
    return sendRequestToOrion(ctxUpdate, UPDATE_PATH, ContextUpdateResponse.class);
  }

  /**
   * Deletes one or more context elements from Orion
   *
   * @param events
   *          events
   * @return The response from the context broker.
   * @throws OrionConnectorException
   *           if a communication exception happens, either when contacting the context broker at
   *           the given address, or obtaining the answer from it.
   */
  public ContextUpdateResponse deleteContextElements(OrionContextElement... events) {
    ContextUpdate ctxUpdate = new ContextUpdate(DELETE, events);
    return sendRequestToOrion(ctxUpdate, UPDATE_PATH, ContextUpdateResponse.class);
  }

  /**
   * Deletes an attribute from a registered Orion context element.
   *
   * @param element
   *          the context element
   * @param attribute
   *          the attribute
   * @return The response from the context broker.
   * @throws OrionConnectorException
   *           if a communication exception happens, either when contacting the context broker at
   *           the given address, or obtaining the answer from it.
   */
  public String deleteContextElementAttribute(OrionContextElement element,
      OrionAttribute<?> attribute) {
    throw new UnsupportedOperationException();
  }

  /**
   * Queries the context broker for a certain element.
   *
   * @param type
   *          The type of context element
   * @param id
   *          the id of the context element
   * @return The response from the context broker.
   * @throws OrionConnectorException
   *           if a communication exception happens, either when contacting the context broker at
   *           the given address, or obtaining the answer from it.
   */
  public QueryContextResponse queryContext(String type, String id) {
    OrionContextElement element = new OrionContextElement();
    element.setId(id);
    element.setType(type);
    QueryContext query = new QueryContext(element);
    return sendRequestToOrion(query, QUERY_PATH, QueryContextResponse.class);
  }

  /**
   * Queries the context broker for a pattern-based group of context elements
   *
   * @param type
   *          the type of the context element.
   * @param pattern
   *          the pattern to search IDs that fulfil this pattern.
   * @return The response from the context broker.
   * @throws OrionConnectorException
   *           if a communication exception happens, either when contacting the context broker at
   *           the given address, or obtaining the answer from it.
   */
  public QueryContextResponse queryContextWithPattern(String type, String pattern) {
    OrionContextElement element = new OrionContextElement();
    element.setId(pattern);
    element.setPattern(true);
    element.setType(type);
    QueryContext query = new QueryContext(element);
    return sendRequestToOrion(query, QUERY_PATH, QueryContextResponse.class);
  }

  /**
   * Sends a request to Orion
   *
   * @param ctxElement
   *          The context element
   * @param path
   *          the path from the context broker that determines which "operation"will be executed
   * @param responseClazz
   *          The class expected for the response
   * @return The object representing the JSON answer from Orion
   * @throws OrionConnectorException
   *           if a communication exception happens, either when contacting the context broker at
   *           the given address, or obtaining the answer from it.
   */
  private <E, T> T sendRequestToOrion(E ctxElement, String path, Class<T> responseClazz) {
    String jsonEntity = gson.toJson(ctxElement);
    log.debug("Send request to Orion: {}", jsonEntity);

    Request req = Request.Post(this.orionAddr.toString() + path)
        .addHeader("Accept", APPLICATION_JSON.getMimeType())
        .bodyString(jsonEntity, APPLICATION_JSON).connectTimeout(5000).socketTimeout(5000);
    Response response;
    try {
      response = req.execute();
    } catch (IOException e) {
      throw new OrionConnectorException("Could not execute HTTP request", e);
    }

    HttpResponse httpResponse = checkResponse(response);

    T ctxResp = getOrionObjFromResponse(httpResponse, responseClazz);
    log.debug("Sent to Orion. Obtained response: {}", httpResponse);

    return ctxResp;
  }

  private <T> HttpResponse checkResponse(Response response) {
    HttpResponse httpResponse;
    try {
      httpResponse = response.returnResponse();
    } catch (IOException e) {
      throw new OrionConnectorException("Could not obtain HTTP response", e);
    }

    if (httpResponse.getStatusLine().getStatusCode() != HttpStatus.SC_OK) {
      throw new OrionConnectorException(
          "Failed with HTTP error code : " + httpResponse.getStatusLine().getStatusCode());
    }
    return httpResponse;
  }

  private <T> T getOrionObjFromResponse(HttpResponse httpResponse, Class<T> responseClazz) {
    InputStream source;
    try {
      source = httpResponse.getEntity().getContent();
    } catch (IllegalStateException | IOException e) {
      throw new OrionConnectorException("Could not obtain entity content from HTTP response", e);
    }

    T ctxResp = null;
    try (Reader reader = new InputStreamReader(source)) {
      ctxResp = gson.fromJson(reader, responseClazz);
    } catch (IOException e) {
      log.warn("Could not close input stream from HttpResponse.", e);
    }

    return ctxResp;
  }

}
